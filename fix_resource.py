import sys
import re

with open('app/teacher-dashboard/page.tsx', 'r') as f:
    content = f.read()

# 1. State variables
content = content.replace(
    'const [newResourceFile, setNewResourceFile] = useState<File | null>(null);',
    'const [newResourceFiles, setNewResourceFiles] = useState<File[]>([]);\n  const [newResourceLinks, setNewResourceLinks] = useState<string[]>([]);\n  const [currentLinkInput, setCurrentLinkInput] = useState("");'
)

content = content.replace(
    'setNewResourceFile(null);',
    'setNewResourceFiles([]);\n    setNewResourceLinks([]);\n    setCurrentLinkInput("");'
)

# 2. handleSendResource
match = re.search(r'const handleSendResource = async \(\) => \{.*?\n  \};\n\n  const handleUpdateResource', content, flags=re.DOTALL)
if match:
    old_handle = match.group(0)
    new_handle = """const handleSendResource = async () => {
    if (sendResourceInFlightRef.current || sendingResource) return;
    setResourceError(null);
    setResourceSaveFeedback(null);

    const groupedStudentIds = Array.from(
      new Set(
        resourceGroupIds.flatMap((groupId) => {
          const group = studentGroups.find((item) => item.id.toString() === groupId);
          return group ? group.members.map((member) => member.id) : [];
        })
      )
    );
    const manuallySelectedStudentIds = Array.from(new Set(newResource.studentIds));
    const targetStudentIds = Array.from(new Set([...groupedStudentIds, ...manuallySelectedStudentIds]));

    if (!teacherEmail) {
      const message = "Teacher email not available.";
      setResourceError(message);
      toast({ variant: "destructive", title: "Cannot send resource", description: message });
      return;
    }

    if (!newResource.title.trim()) {
      const message = "Title is required.";
      setResourceError(message);
      toast({ title: "Missing title", description: message, className: "border-slate-300 bg-slate-100 text-slate-800" });
      return;
    }

    if (!newResource.type) {
      const message = "Type is required.";
      setResourceError(message);
      toast({ title: "Missing type", description: message, className: "border-slate-300 bg-slate-100 text-slate-800" });
      return;
    }

    if (newResource.category === "personal" && targetStudentIds.length === 0) {
      const message = "Select at least one student or group.";
      setResourceError(message);
      toast({ title: "No students selected", description: message, className: "border-slate-300 bg-slate-100 text-slate-800" });
      return;
    }

    const hasLinks = newResourceLinks.length > 0 || currentLinkInput.trim() !== "";
    const hasFiles = newResourceFiles.length > 0;

    if (!hasLinks && !hasFiles) {
      const message = "Attach at least one file or provide a link URL.";
      setResourceError(message);
      toast({ title: "File or link required", description: message, className: "border-slate-300 bg-slate-100 text-slate-800" });
      return;
    }

    sendResourceInFlightRef.current = true;
    setSendingResource(true);
    showResourceSaveFeedback("saving", "Sending resources...");
    
    try {
      const finalLinks = [...newResourceLinks];
      if (currentLinkInput.trim() !== "" && !finalLinks.includes(currentLinkInput.trim())) {
        finalLinks.push(currentLinkInput.trim());
      }

      const totalItems = newResourceFiles.length + finalLinks.length;
      let successCount = 0;
      let allCreatedResources: any[] = [];

      const createResourceRecord = async (fileUrl: string | null, linkUrl: string | null, fileObj: File | null) => {
        const payload = {
          title: newResource.title + (totalItems > 1 && fileObj ? ` - ${fileObj.name}` : totalItems > 1 && linkUrl ? ' - Link' : ''),
          description: newResource.description,
          type: newResource.type,
          fileUrl,
          linkUrl,
          fileName: fileObj?.name || null,
          fileSize: fileObj?.size || null,
          program: "",
          subject: "",
          grade: "",
          teacherEmail,
          isPublic: newResource.category === "general",
          assignmentIds: [],
          studentIds: targetStudentIds,
        };

        const createResponse = await fetch("/api/teacher/resources", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await createResponse.json();
        if (!data.success) throw new Error(data.error || "Failed to send resource");
        return data.resource;
      };

      for (const file of newResourceFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", newResource.type);
        
        const uploadResponse = await fetch("/api/teacher/upload-r2", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();
        if (!uploadData.success) throw new Error(uploadData.error || "Upload failed");
        
        const resObj = await createResourceRecord(uploadData.fileUrl, null, file);
        if (resObj) allCreatedResources.push(resObj);
        successCount++;
      }

      for (const linkUrl of finalLinks) {
        const resObj = await createResourceRecord(null, linkUrl, null);
        if (resObj) allCreatedResources.push(resObj);
        successCount++;
      }

      if (allCreatedResources.length > 0) {
        setResources((prev) => {
          let next = [...prev];
          allCreatedResources.forEach(res => {
            next = next.filter(item => item.id !== res.id);
            next.unshift(res);
          });
          return next;
        });
      }
      
      void fetchResources();
      resetResourceForm();
      
      toast({
        title: "Resources sent",
        description: newResource.category === "general" ? "Your resources have been published." : "Your resources have been shared with the selected students.",
        className: "border-slate-300 bg-slate-100 text-slate-800",
      });
      showResourceSaveFeedback("success", `Successfully sent ${successCount} resource(s).`);

    } catch (error) {
      console.error('Resource send failed:', error);
      const message = error instanceof Error ? error.message : "Upload failed";
      setResourceError(message);
      toast({ variant: "destructive", title: "Failed", description: message });
      showResourceSaveFeedback("error", "Failed to send resource");
    } finally {
      setSendingResource(false);
      sendResourceInFlightRef.current = false;
    }
  };

  const handleUpdateResource"""
    content = content.replace(old_handle, new_handle)
else:
    print("handleSendResource not found")
    sys.exit(1)

content = content.replace('const isAssignmentResourceCategory = newResource.category === "assignment";', 'const isAssignmentResourceCategory = false;')

content = re.sub(
    r'const isResourceSubmitDisabled =[\s\S]*?;',
    'const isResourceSubmitDisabled = sendingResource || !newResource.title.trim() || !newResource.type || (newResourceFiles.length === 0 && newResourceLinks.length === 0 && currentLinkInput.trim() === "");',
    content,
    count=1
)

ui_match = re.search(r'<Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">[\s\S]*?Send Resource to Students[\s\S]*?<\/CardTitle>[\s\S]*?<\/CardHeader>[\s\S]*?<\/CardContent>\s*<\/Card>', content)
if ui_match:
    old_ui = ui_match.group(0)
    new_ui = """<Card className="border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md">
                  <CardHeader className="pb-3 border-b border-slate-100 bg-gradient-to-r from-brand-blue/10 to-brand-teal/10 rounded-t-xl">
                    <CardTitle className="text-lg flex items-center gap-2 text-brand-blue">
                      <Send className="h-5 w-5" />
                      Send Resource to Students
                    </CardTitle>
                    <CardDescription>
                      Share learning materials with individuals or groups.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700">Title *</Label>
                        <Input
                          value={newResource.title}
                          onChange={(e) => setNewResource({ ...newResource, title: e.target.value })}
                          placeholder="e.g., Chapter 4 Study Guide"
                          className="bg-slate-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Category *</Label>
                        <select
                          value={newResource.category}
                          onChange={(e) => {
                            const nextCategory = e.target.value as ResourceCategory;
                            setNewResource((prev) => ({
                              ...prev,
                              category: nextCategory,
                              assignmentId: null,
                              studentIds: nextCategory === "personal" ? [] : prev.studentIds
                            }));
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="personal">Personal (Specific Students)</option>
                          <option value="general">General (Public / Broadcast)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-slate-700">What kind of resource? *</Label>
                        <select
                          value={newResource.type}
                          onChange={(e) => setNewResource({ ...newResource, type: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-200 rounded-md bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="document">Document</option>
                          <option value="video">Video</option>
                          <option value="image">Image</option>
                          <option value="link">Link / URL</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-700">Description</Label>
                        <Input
                          value={newResource.description}
                          onChange={(e) => setNewResource({ ...newResource, description: e.target.value })}
                          placeholder="Short description (optional)"
                          className="bg-slate-50"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="space-y-3">
                        <Label className="text-slate-700 flex items-center gap-2">
                          <FileText className="h-4 w-4 text-slate-500" />
                          Attach Resources (Multiple Allowed)
                        </Label>
                        <Input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.jpg,.png,.ppt,.pptx,.xlsx,.mp4,.mov"
                          onChange={(e) => {
                            if (e.target.files) {
                              setNewResourceFiles((prev) => [...prev, ...Array.from(e.target.files as FileList)]);
                            }
                            e.target.value = '';
                          }}
                          className="bg-white cursor-pointer"
                        />
                        {newResourceFiles.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {newResourceFiles.map((f, i) => (
                              <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-md p-2 text-sm">
                                <span className="truncate max-w-[200px] text-slate-700">{f.name}</span>
                                <button
                                  className="text-red-500 hover:text-red-700 ml-2"
                                  onClick={() => setNewResourceFiles(prev => prev.filter((_, idx) => idx !== i))}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <Label className="text-slate-700 flex items-center gap-2">
                          <ExternalLink className="h-4 w-4 text-slate-500" />
                          Link URLs (Multiple Allowed)
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="https://..."
                            value={currentLinkInput}
                            onChange={(e) => setCurrentLinkInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && currentLinkInput.trim() !== '') {
                                e.preventDefault();
                                if (!newResourceLinks.includes(currentLinkInput.trim())) {
                                  setNewResourceLinks(prev => [...prev, currentLinkInput.trim()]);
                                }
                                setCurrentLinkInput("");
                              }
                            }}
                            className="bg-white"
                          />
                          <Button 
                            type="button" 
                            variant="secondary"
                            onClick={() => {
                              if (currentLinkInput.trim() !== '' && !newResourceLinks.includes(currentLinkInput.trim())) {
                                setNewResourceLinks(prev => [...prev, currentLinkInput.trim()]);
                                setCurrentLinkInput("");
                              }
                            }}
                          >
                            Add
                          </Button>
                        </div>
                        {newResourceLinks.length > 0 && (
                          <div className="space-y-2 mt-2">
                            {newResourceLinks.map((link, i) => (
                              <div key={i} className="flex items-center justify-between bg-white border border-slate-200 rounded-md p-2 text-sm">
                                <span className="truncate max-w-[200px] text-blue-600">{link}</span>
                                <button
                                  className="text-red-500 hover:text-red-700 ml-2"
                                  onClick={() => setNewResourceLinks(prev => prev.filter((_, idx) => idx !== i))}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4 pt-2 border-t border-slate-100">
                      <h4 className="text-sm font-medium text-slate-900">Target Audience</h4>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label className="text-slate-700">Assign to Groups (Optional)</Label>
                          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 h-48 overflow-y-auto">
                            {studentGroups.length === 0 ? (
                              <p className="text-sm text-slate-500 p-2 text-center">No groups available.</p>
                            ) : (
                              studentGroups.map((group) => (
                                <div key={group.id} className="rounded-md border border-slate-200 bg-white p-2.5 shadow-sm hover:border-blue-200 transition-colors">
                                  <div className="flex items-center justify-between gap-2">
                                    <label className="flex cursor-pointer items-center gap-3 text-sm">
                                      <input
                                        type="checkbox"
                                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                                        checked={resourceGroupIds.includes(group.id.toString())}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setResourceGroupIds((prev) => [...prev, group.id.toString()]);
                                          } else {
                                            setResourceGroupIds((prev) => prev.filter((id) => id !== group.id.toString()));
                                          }
                                        }}
                                      />
                                      <span className="font-medium text-slate-700">{group.name} <span className="text-slate-400 font-normal">({group.members.length})</span></span>
                                    </label>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <Label className="text-slate-700">Select Students {newResource.category === "personal" ? "*" : "(Optional)"}</Label>
                          <div className="h-48 space-y-2 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3">
                            {students.map((student) => {
                              const lockedByGroup = groupedResourceStudentIdSet.has(student.id);
                              const checked = lockedByGroup || newResource.studentIds.includes(student.id);
                              return (
                                <label key={student.id} className="flex items-center justify-between rounded-md border border-slate-200 bg-white p-2.5 shadow-sm hover:border-blue-200 transition-colors text-sm cursor-pointer">
                                  <span className="font-medium text-slate-700">
                                    {student.name} <span className="text-slate-400 font-normal hidden sm:inline">({student.email})</span>
                                  </span>
                                  <span className="flex items-center gap-3">
                                    {lockedByGroup && <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Group Selected</span>}
                                    <Checkbox
                                      checked={checked}
                                      disabled={lockedByGroup}
                                      className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                      onCheckedChange={(value) => {
                                        if (value) {
                                          setNewResource({
                                            ...newResource,
                                            studentIds: Array.from(new Set([...newResource.studentIds, student.id]))
                                          });
                                        } else {
                                          setNewResource({
                                            ...newResource,
                                            studentIds: newResource.studentIds.filter((id) => id !== student.id)
                                          });
                                        }
                                      }}
                                    />
                                  </span>
                                </label>
                              );
                            })}
                            {students.length === 0 && (
                              <p className="text-sm text-slate-500 p-2 text-center">No students found.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      {resourceSaveFeedback && (
                        <span
                          className={
                            resourceSaveFeedback.type === "saving"
                              ? "mr-auto rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm text-blue-800 flex items-center gap-2"
                              : resourceSaveFeedback.type === "success"
                                ? "mr-auto rounded-md border border-green-200 bg-green-50 px-3 py-1.5 text-sm text-green-800 flex items-center gap-2"
                                : "mr-auto rounded-md border border-red-200 bg-red-50 px-3 py-1.5 text-sm text-red-800 flex items-center gap-2"
                          }
                        >
                          {resourceSaveFeedback.type === "saving" && <RefreshCw className="h-4 w-4 animate-spin" />}
                          {resourceSaveFeedback.type === "success" && <CheckCircle className="h-4 w-4" />}
                          {resourceSaveFeedback.type === "error" && <AlertCircle className="h-4 w-4" />}
                          {resourceSaveFeedback.message}
                        </span>
                      )}
                      {resourceError && (
                        <span className="text-sm text-red-600 mr-auto flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          {resourceError}
                        </span>
                      )}
                      <Button
                        onClick={handleSendResource}
                        disabled={isResourceSubmitDisabled}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                      >
                        {sendingResource ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Send Resource
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>"""
    content = content.replace(old_ui, new_ui)
else:
    print("UI card not found")
    sys.exit(1)

content = content.replace(
    '{resources.map((resource) => {',
    '''{resources
                          .filter((res) => {
                            const cat = inferResourceCategory(res);
                            if (cat !== "general" && cat !== "personal") return false;
                            const t = res.type?.toLowerCase() || "";
                            const title = res.title?.toLowerCase() || "";
                            if (t === "mcq" || t === "pdf" || t === "mcq+pdf" || t.includes("mcq")) return false;
                            if (title.includes("mcq") || title.includes("mcq+pdf")) return false;
                            return true;
                          })
                          .map((resource) => {'''
)

with open('app/teacher-dashboard/page.tsx', 'w') as f:
    f.write(content)

print("Replacement done")

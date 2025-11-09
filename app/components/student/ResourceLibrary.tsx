"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Download,
  ExternalLink,
  FileText,
  Video,
  Image as ImageIcon,
  Link as LinkIcon,
  Search,
  Filter,
  Clock,
  CheckCircle,
  User,
  Users,
  Send,
  Upload,
  MessageCircle,
  Plus,
  RefreshCw
} from 'lucide-react';

interface Resource {
  id: number;
  title: string;
  description?: string;
  type: string;
  fileUrl?: string;
  linkUrl?: string;
  fileName?: string;
  fileSize?: number;
  program: string;
  subject: string;
  grade: string;
  isStudentSpecific: boolean;
  isRequired?: boolean;
  assignmentId?: number;
  assignmentTitle?: string;
  assignmentSubject?: string;
  assignedAt?: string;
  viewedAt?: string;
  createdAt: string;
}

interface Teacher {
  id: number;
  name: string;
  email: string;
  programs: string[];
  program: string;
  assignedAt: string;
}

interface StudentSubmission {
  id: number;
  title: string;
  description?: string;
  content?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  submittedAt: string;
  updatedAt: string;
  teachers: Teacher[];
  teacherRemarks: Array<{
    id: number;
    remark: string;
    createdAt: string;
    updatedAt: string;
    teacher: {
      id: number;
      name: string;
      email: string;
    };
  }>;
}

interface ResourceLibraryProps {
  studentEmail: string;
}

export default function ResourceLibrary({ studentEmail }: ResourceLibraryProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Student submissions state
  const [submissions, setSubmissions] = useState<StudentSubmission[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(false);
  
  // Submission form state
  const [submissionTitle, setSubmissionTitle] = useState('');
  const [submissionDescription, setSubmissionDescription] = useState('');
  const [submissionContent, setSubmissionContent] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);

  // Fetch resources
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/student/resources?studentEmail=${encodeURIComponent(studentEmail)}`);
        const data = await response.json();
        
        if (data.success) {
          setResources(data.resources);
        } else {
          console.error('Failed to fetch resources:', data.error);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
      } finally {
        setLoading(false);
      }
    };

    if (studentEmail) {
      fetchResources();
    }
  }, [studentEmail]);

  // Fetch teachers and submissions
  useEffect(() => {
    const fetchTeachersAndSubmissions = async () => {
      if (!studentEmail) return;
      
      try {
        setSubmissionsLoading(true);
        
        // Fetch teachers
        const teachersResponse = await fetch(`/api/student/teachers?studentEmail=${encodeURIComponent(studentEmail)}`);
        const teachersData = await teachersResponse.json();
        
        if (teachersData.success) {
          setTeachers(teachersData.teachers);
        }
        
        // Fetch submissions
        const submissionsResponse = await fetch(`/api/student/submissions/resources?studentEmail=${encodeURIComponent(studentEmail)}`);
        const submissionsData = await submissionsResponse.json();
        
        if (submissionsData.success) {
          setSubmissions(submissionsData.submissions);
        }
      } catch (error) {
        console.error('Error fetching teachers and submissions:', error);
      } finally {
        setSubmissionsLoading(false);
      }
    };

    fetchTeachersAndSubmissions();
  }, [studentEmail]);

  // Mark resource as viewed
  const markAsViewed = async (resourceId: number) => {
    if (resources.find(r => r.id === resourceId)?.viewedAt) return;
    
    try {
      await fetch('/api/student/resources/view', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail,
          resourceId
        })
      });

      // Update local state
      setResources(prev => prev.map(r => 
        r.id === resourceId 
          ? { ...r, viewedAt: new Date().toISOString() }
          : r
      ));
    } catch (error) {
      console.error('Error marking resource as viewed:', error);
    }
  };

  // Handle submission creation
  const handleSubmission = async () => {
    if (!submissionTitle.trim() || selectedTeachers.length === 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      let fileUrl = null;
      
      // Upload file if provided
      if (submissionFile) {
        try {
          // Method 1: Try direct upload with presigned URL
          const presignedResponse = await fetch('/api/r2-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              studentId: 0, // Will be set by the API
              assignmentId: 0, // Not needed for resource submissions
              fileName: submissionFile.name,
              fileType: submissionFile.type,
              fileSize: submissionFile.size,
            }),
          });
          
          const presignedData = await presignedResponse.json();
          
          // Use server-side upload directly (presigned URLs have issues with R2)
          const formData = new FormData();
          formData.append('file', submissionFile);
          formData.append('studentId', '0');
          formData.append('assignmentId', '0'); // Resource library doesn't need assignment
          
          const uploadResponse = await fetch('/api/upload-r2', {
            method: 'POST',
            body: formData,
          });
          
          const uploadData = await uploadResponse.json();
          
          if (uploadData.success) {
            fileUrl = uploadData.fileUrl;
          } else {
            console.error('Upload failed:', uploadData);
            throw new Error(`Upload failed: ${uploadData.error || 'Unknown error'}`);
          }
        } catch (uploadError) {
          console.error('File upload failed:', uploadError);
          throw uploadError;
        }
      }
      
      // Create submission
      const submissionResponse = await fetch('/api/student/submissions/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentEmail,
          title: submissionTitle,
          description: submissionDescription,
          content: submissionContent,
          fileUrl,
          fileName: submissionFile?.name,
          fileSize: submissionFile?.size,
          teacherIds: selectedTeachers,
        }),
      });
      
      const submissionData = await submissionResponse.json();
      
      if (submissionData.success) {
        // Reset form
        setSubmissionTitle('');
        setSubmissionDescription('');
        setSubmissionContent('');
        setSubmissionFile(null);
        setSelectedTeachers([]);
        setShowSubmissionDialog(false);
        
        // Refresh submissions
        const submissionsResponse = await fetch(`/api/student/submissions/resources?studentEmail=${encodeURIComponent(studentEmail)}`);
        const refreshedData = await submissionsResponse.json();
        if (refreshedData.success) {
          setSubmissions(refreshedData.submissions);
        }
      } else {
        console.error('Submission failed:', submissionData.error);
      }
    } catch (error) {
      console.error('Error creating submission:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle teacher selection
  const handleTeacherSelection = (teacherId: number, checked: boolean) => {
    if (checked) {
      setSelectedTeachers(prev => [...prev, teacherId]);
    } else {
      setSelectedTeachers(prev => prev.filter(id => id !== teacherId));
    }
  };

  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 text-green-500" />;
      case 'link':
        return <LinkIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Filter resources
  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         resource.assignmentTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesSubject = selectedSubject === 'all' || resource.subject === selectedSubject;
    
    return matchesSearch && matchesType && matchesSubject;
  });

  // Get unique values for filters
  const uniqueTypes = [...new Set(resources.map(r => r.type))];
  const uniqueSubjects = [...new Set(resources.map(r => r.subject))];

  // Separate resources by category
  const assignmentResources = filteredResources.filter(r => r.assignmentTitle);
  const generalResources = filteredResources.filter(r => !r.assignmentTitle);
  const studentSpecificResources = filteredResources.filter(r => r.isStudentSpecific);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-500">Loading resources...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Resource Library</h2>
          <p className="text-gray-600">Access study materials, documents, and resources</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">All Types</option>
            {uniqueTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 border rounded-md bg-white"
          >
            <option value="all">All Subjects</option>
            {uniqueSubjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Resource Categories */}
      <Tabs defaultValue="assignment" className="space-y-6">
        <TabsList>
          <TabsTrigger value="assignment">Assignment Resources ({assignmentResources.length})</TabsTrigger>
          <TabsTrigger value="personal">Personal Resources ({studentSpecificResources.length})</TabsTrigger>
          <TabsTrigger value="general">General Resources ({generalResources.length})</TabsTrigger>
          <TabsTrigger value="submissions">My Submissions ({submissions.length})</TabsTrigger>
        </TabsList>

        {/* Assignment Resources */}
        <TabsContent value="assignment" className="space-y-4">
          {assignmentResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No assignment resources found.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignmentResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                      </div>
                      {!resource.viewedAt && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                          New
                        </Badge>
                      )}
                    </div>
                    
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Assignment Info */}
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="text-sm font-medium text-blue-900">
                        {resource.assignmentTitle}
                      </div>
                      <div className="text-xs text-blue-600">
                        {resource.assignmentSubject}
                      </div>
                    </div>
                    
                    {/* Resource Info */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                      {resource.isRequired && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    
                    {resource.fileSize && (
                      <div className="text-xs text-gray-500">
                        Size: {formatFileSize(resource.fileSize)}
                      </div>
                    )}
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      {resource.fileUrl && (
                        <Button
                          size="sm"
                          onClick={() => {
                            markAsViewed(resource.id);
                            window.open(resource.fileUrl, '_blank');
                          }}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      {resource.linkUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markAsViewed(resource.id);
                            window.open(resource.linkUrl, '_blank');
                          }}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Link
                        </Button>
                      )}
                    </div>
                    
                    {/* Status */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {resource.isStudentSpecific ? <User className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                        {resource.isStudentSpecific ? 'Personal' : 'Shared'}
                      </div>
                      <div className="flex items-center gap-1">
                        {resource.viewedAt ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Viewed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Not viewed
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Personal Resources */}
        <TabsContent value="personal" className="space-y-4">
          {studentSpecificResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No personal resources assigned.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {studentSpecificResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow border-blue-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getResourceIcon(resource.type)}
                        <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                      </div>
                      <Badge variant="default" className="bg-blue-600 text-xs">
                        Personal
                      </Badge>
                    </div>
                    
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Similar content structure as assignment resources */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                    </div>
                    
                    {resource.fileSize && (
                      <div className="text-xs text-gray-500">
                        Size: {formatFileSize(resource.fileSize)}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {resource.fileUrl && (
                        <Button
                          size="sm"
                          onClick={() => {
                            markAsViewed(resource.id);
                            window.open(resource.fileUrl, '_blank');
                          }}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      {resource.linkUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markAsViewed(resource.id);
                            window.open(resource.linkUrl, '_blank');
                          }}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Link
                        </Button>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div>
                        Assigned: {new Date(resource.assignedAt || resource.createdAt).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        {resource.viewedAt ? (
                          <>
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            Viewed
                          </>
                        ) : (
                          <>
                            <Clock className="h-3 w-3" />
                            Not viewed
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* General Resources */}
        <TabsContent value="general" className="space-y-4">
          {generalResources.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No general resources available.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {generalResources.map((resource) => (
                <Card key={resource.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2">
                      {getResourceIcon(resource.type)}
                      <CardTitle className="text-lg leading-tight">{resource.title}</CardTitle>
                    </div>
                    
                    {resource.description && (
                      <p className="text-sm text-gray-600 mt-2">{resource.description}</p>
                    )}
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="text-xs">
                        {resource.subject}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.type}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {resource.program}
                      </Badge>
                    </div>
                    
                    {resource.fileSize && (
                      <div className="text-xs text-gray-500">
                        Size: {formatFileSize(resource.fileSize)}
                      </div>
                    )}
                    
                    <div className="flex gap-2">
                      {resource.fileUrl && (
                        <Button
                          size="sm"
                          onClick={() => {
                            markAsViewed(resource.id);
                            window.open(resource.fileUrl, '_blank');
                          }}
                          className="flex-1"
                        >
                          <Download className="h-4 w-4 mr-1" />
                          Download
                        </Button>
                      )}
                      {resource.linkUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            markAsViewed(resource.id);
                            window.open(resource.linkUrl, '_blank');
                          }}
                          className="flex-1"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open Link
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Student Submissions */}
        <TabsContent value="submissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Submit to Teachers</h3>
              <p className="text-sm text-gray-600">Share your work and get feedback from your teachers</p>
            </div>
            
            <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Submission
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Submit Work to Teachers</DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter submission title"
                      value={submissionTitle}
                      onChange={(e) => setSubmissionTitle(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Brief description (optional)"
                      value={submissionDescription}
                      onChange={(e) => setSubmissionDescription(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      placeholder="Write your content here..."
                      value={submissionContent}
                      onChange={(e) => setSubmissionContent(e.target.value)}
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="file">Attach File (Optional)</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.png,.ppt,.pptx,.xlsx"
                      onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-gray-500">
                      Supported: PDF, DOC, DOCX, TXT, JPG, PNG, PPT, PPTX, XLSX (Max 10MB)
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Select Teachers * (At least one required)</Label>
                    <div className="border rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
                      {teachers.map((teacher) => (
                        <div key={teacher.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`teacher-${teacher.id}`}
                            checked={selectedTeachers.includes(teacher.id)}
                            onCheckedChange={(checked) => 
                              handleTeacherSelection(teacher.id, checked as boolean)
                            }
                          />
                          <Label 
                            htmlFor={`teacher-${teacher.id}`}
                            className="text-sm cursor-pointer flex-1"
                          >
                            {teacher.name}
                            <span className="text-gray-500 ml-1">({teacher.program})</span>
                          </Label>
                        </div>
                      ))}
                      {teachers.length === 0 && (
                        <p className="text-sm text-gray-500">No teachers found.</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button
                    onClick={handleSubmission}
                    disabled={isSubmitting || !submissionTitle.trim() || selectedTeachers.length === 0}
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Submit to Teachers
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Submissions List */}
          {submissionsLoading ? (
            <div className="text-center py-8 text-gray-500">
              Loading submissions...
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Submissions Yet</h3>
              <p className="text-gray-600 mb-4">
                Start sharing your work with teachers to get feedback and guidance.
              </p>
              <Button onClick={() => setShowSubmissionDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Submission
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{submission.title}</CardTitle>
                        {submission.description && (
                          <p className="text-sm text-gray-600 mt-1">{submission.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Submitted {new Date(submission.submittedAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {submission.teachers.length} teacher{submission.teachers.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      <Badge variant={submission.teacherRemarks.length > 0 ? 'default' : 'secondary'}>
                        {submission.teacherRemarks.length > 0 ? 'Has Feedback' : 'Pending Review'}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    {/* Content Preview */}
                    {submission.content && (
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-800 line-clamp-3">{submission.content}</p>
                      </div>
                    )}
                    
                    {/* File Attachment */}
                    {submission.fileUrl && submission.fileName && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-900">{submission.fileName}</p>
                          {submission.fileSize && (
                            <p className="text-xs text-blue-700">
                              {(submission.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                          )}
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(submission.fileUrl, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Open
                        </Button>
                      </div>
                    )}
                    
                    {/* Teachers */}
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Sent to:</p>
                      <div className="flex flex-wrap gap-2">
                        {submission.teachers.map((teacher) => (
                          <Badge key={teacher.id} variant="outline" className="text-xs">
                            {teacher.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    {/* Teacher Remarks */}
                    {submission.teacherRemarks.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700">Teacher Feedback:</p>
                        {submission.teacherRemarks.map((remark) => (
                          <div key={remark.id} className="bg-green-50 p-3 rounded-lg border-l-4 border-green-200">
                            <div className="flex items-start justify-between mb-2">
                              <p className="text-sm font-medium text-green-900">{remark.teacher.name}</p>
                              <p className="text-xs text-green-600">
                                {new Date(remark.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-green-800">{remark.remark}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
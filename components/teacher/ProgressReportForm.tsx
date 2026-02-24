"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Save, Send, Plus, X } from "lucide-react";

interface ProgressReportFormProps {
  studentId: number;
  studentName: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  existingReport?: any;
}

const ProgressReportForm: React.FC<ProgressReportFormProps> = ({
  studentId,
  studentName,
  onSubmit,
  onCancel,
  existingReport,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    reportPeriod: existingReport?.reportPeriod || "",
    subject: existingReport?.subject || "",
    overallProgress: existingReport?.overallProgress || "",
    progressRating: existingReport?.progressRating?.toString() || "",
    attendanceRate: existingReport?.attendanceRate?.toString() || "",
    classParticipation: existingReport?.classParticipation || "",
    homeworkCompletion: existingReport?.homeworkCompletion?.toString() || "",
    recommendations: existingReport?.recommendations || "",
    parentNotes: existingReport?.parentNotes || "",
    status: existingReport?.status || "draft",
  });

  // Array fields
  const [milestones, setMilestones] = useState<string[]>(
    existingReport?.milestonesAchieved
      ? JSON.parse(existingReport.milestonesAchieved)
      : [""]
  );
  const [publications, setPublications] = useState<string[]>(
    existingReport?.publications ? JSON.parse(existingReport.publications) : [""]
  );
  const [skills, setSkills] = useState<string[]>(
    existingReport?.skillsImproved ? JSON.parse(existingReport.skillsImproved) : [""]
  );
  const [strengths, setStrengths] = useState<string[]>(
    existingReport?.strengthsAreas
      ? JSON.parse(existingReport.strengthsAreas)
      : [""]
  );
  const [improvements, setImprovements] = useState<string[]>(
    existingReport?.improvementAreas
      ? JSON.parse(existingReport.improvementAreas)
      : [""]
  );
  const [nextSteps, setNextSteps] = useState<string[]>(
    existingReport?.nextSteps ? JSON.parse(existingReport.nextSteps) : [""]
  );

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (
    index: number,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const addArrayItem = (setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter((prev) => [...prev, ""]);
  };

  const removeArrayItem = (
    index: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft: boolean) => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        studentId,
        reportPeriod: formData.reportPeriod,
        subject: formData.subject,
        overallProgress: formData.overallProgress,
        progressRating: formData.progressRating,
        attendanceRate: formData.attendanceRate,
        milestonesAchieved: milestones.filter((m) => m.trim()),
        publications: publications.filter((p) => p.trim()),
        skillsImproved: skills.filter((s) => s.trim()),
        strengthsAreas: strengths.filter((s) => s.trim()),
        improvementAreas: improvements.filter((i) => i.trim()),
        nextSteps: nextSteps.filter((n) => n.trim()),
        recommendations: formData.recommendations,
        parentNotes: formData.parentNotes,
        classParticipation: formData.classParticipation,
        homeworkCompletion: formData.homeworkCompletion,
        status: isDraft ? "draft" : "published",
        isVisible: !isDraft,
      };

      const method = existingReport ? "PUT" : "POST";
      const body = existingReport
        ? { reportId: existingReport.id, ...payload }
        : payload;

      const response = await fetch("/api/teacher/progress-report", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save report");
      }

      setSuccess(
        isDraft
          ? "Report saved as draft successfully!"
          : "Report published successfully!"
      );

      setTimeout(() => {
        if (onSubmit) onSubmit();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const ArrayInput = ({
    label,
    items,
    setter,
    placeholder,
  }: {
    label: string;
    items: string[];
    setter: React.Dispatch<React.SetStateAction<string[]>>;
    placeholder: string;
  }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <Input
            value={item}
            onChange={(e) => handleArrayChange(index, e.target.value, setter)}
            placeholder={placeholder}
            className="flex-1"
          />
          {items.length > 1 && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeArrayItem(index, setter)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => addArrayItem(setter)}
        className="mt-2"
      >
        <Plus className="h-4 w-4 mr-1" /> Add More
      </Button>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {existingReport ? "Edit" : "Create"} Progress Report for {studentName}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <AlertDescription className="text-green-800">
              {success}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="reportPeriod">Report Period *</Label>
              <Input
                id="reportPeriod"
                name="reportPeriod"
                value={formData.reportPeriod}
                onChange={handleInputChange}
                placeholder="e.g., January 2026, Q1 2026"
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject/Program *</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="e.g., Mathematics, Research"
              />
            </div>
          </div>

          {/* Overall Progress */}
          <div>
            <Label htmlFor="overallProgress">Overall Progress Summary *</Label>
            <Textarea
              id="overallProgress"
              name="overallProgress"
              value={formData.overallProgress}
              onChange={handleInputChange}
              placeholder="Provide a comprehensive summary of the student's overall progress..."
              rows={4}
              required
            />
          </div>

          {/* Ratings & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="progressRating">Progress Rating (1-10)</Label>
              <Input
                id="progressRating"
                name="progressRating"
                type="number"
                min="1"
                max="10"
                value={formData.progressRating}
                onChange={handleInputChange}
                placeholder="1-10"
              />
            </div>
            <div>
              <Label htmlFor="attendanceRate">Attendance Rate (%)</Label>
              <Input
                id="attendanceRate"
                name="attendanceRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.attendanceRate}
                onChange={handleInputChange}
                placeholder="0-100"
              />
            </div>
            <div>
              <Label htmlFor="homeworkCompletion">Homework Completion (%)</Label>
              <Input
                id="homeworkCompletion"
                name="homeworkCompletion"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.homeworkCompletion}
                onChange={handleInputChange}
                placeholder="0-100"
              />
            </div>
          </div>

          {/* Array Fields */}
          <ArrayInput
            label="Milestones Achieved"
            items={milestones}
            setter={setMilestones}
            placeholder="e.g., Completed research paper, Won competition"
          />

          <ArrayInput
            label="Publications & Work"
            items={publications}
            setter={setPublications}
            placeholder="e.g., Published paper in journal XYZ"
          />

          <ArrayInput
            label="Skills Improved"
            items={skills}
            setter={setSkills}
            placeholder="e.g., Critical thinking, Problem solving"
          />

          <ArrayInput
            label="Strength Areas"
            items={strengths}
            setter={setStrengths}
            placeholder="e.g., Quick learner, Strong analytical skills"
          />

          <ArrayInput
            label="Areas for Improvement"
            items={improvements}
            setter={setImprovements}
            placeholder="e.g., Time management, Attention to detail"
          />

          <ArrayInput
            label="Next Steps & Goals"
            items={nextSteps}
            setter={setNextSteps}
            placeholder="e.g., Complete chapter 5, Start new project"
          />

          {/* Additional Notes */}
          <div>
            <Label htmlFor="classParticipation">Class Participation Notes</Label>
            <Textarea
              id="classParticipation"
              name="classParticipation"
              value={formData.classParticipation}
              onChange={handleInputChange}
              placeholder="Notes on student's engagement and participation in class..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="recommendations">Recommendations</Label>
            <Textarea
              id="recommendations"
              name="recommendations"
              value={formData.recommendations}
              onChange={handleInputChange}
              placeholder="Your recommendations for the student's continued growth..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="parentNotes">Notes for Parents</Label>
            <Textarea
              id="parentNotes"
              name="parentNotes"
              value={formData.parentNotes}
              onChange={handleInputChange}
              placeholder="Special notes or messages for parents..."
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSubmit(true)}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save as Draft
            </Button>
            <Button
              type="button"
              onClick={() => handleSubmit(false)}
              disabled={loading || !formData.overallProgress}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Publish Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressReportForm;

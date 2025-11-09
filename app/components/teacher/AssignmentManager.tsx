"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Save, X, Calendar, FileText, Users, Clock } from "lucide-react";

interface Assignment {
  id: number;
  title: string;
  description: string;
  instructions: string;
  program: string;
  subject: string;
  grade: string;
  dueDate: string;
  totalPoints: number;
  allowLateSubmission: boolean;
  isActive: boolean;
  submissions: any[];
  resources: any[];
  targetStudent?: {
    id: number;
    name: string;
    email: string;
  };
}

interface Student {
  id: number;
  name: string;
  email: string;
  program: string;
  grade: string;
}

interface AssignmentFormData {
  title: string;
  description: string;
  instructions: string;
  program: string;
  subject: string;
  dueDate: string;
  totalPoints: number;
  allowLateSubmission: boolean;
  studentId: string; // Add student field
}

interface AssignmentManagerProps {
  teacherEmail: string;
  assignments: Assignment[];
  onAssignmentCreated: () => void;
  onAssignmentUpdated: () => void;
}

const PROGRAMS = [
  "Academic Tutoring",
  "SAT Coaching",
  "College Prep",
  "Math Competition",
  "Research Program"
];

const SUBJECTS = [
  "Mathematics",
  "Science",
  "English",
  "History",
  "Computer Science",
  "Physics",
  "Chemistry",
  "Biology"
];

// Separate AssignmentForm component to prevent recreation on every render
const AssignmentForm = ({ 
  formData, 
  setFormData, 
  students, 
  availablePrograms 
}: {
  formData: AssignmentFormData;
  setFormData: (data: AssignmentFormData) => void;
  students: Student[];
  availablePrograms: string[];
}) => {
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="title">Assignment Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter assignment title"
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Brief description of the assignment"
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="instructions">Detailed Instructions</Label>
        <Textarea
          id="instructions"
          value={formData.instructions}
          onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
          placeholder="Detailed instructions for students"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="program">Program *</Label>
          <Select value={formData.program} onValueChange={(value) => {
            setFormData({ ...formData, program: value, studentId: "" }); // Reset student when program changes
          }}>
            <SelectTrigger>
              <SelectValue placeholder="Select program" />
            </SelectTrigger>
            <SelectContent>
              {availablePrograms.map((program) => (
                <SelectItem key={program} value={program}>
                  {program}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="subject">Subject *</Label>
          <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Student Selection */}
      <div>
        <Label htmlFor="student">Assign to Student *</Label>
        <Select 
          value={formData.studentId} 
          onValueChange={(value) => setFormData({ ...formData, studentId: value })}
          disabled={!formData.program}
        >
          <SelectTrigger>
            <SelectValue placeholder={formData.program ? "Select student" : "Select a program first"} />
          </SelectTrigger>
          <SelectContent>
            {students
              .filter(student => student.program === formData.program)
              .map((student) => (
                <SelectItem key={student.id} value={student.id.toString()}>
                  {student.name} ({student.grade}) - {student.email}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
        {formData.program && students.filter(s => s.program === formData.program).length === 0 && (
          <p className="text-sm text-orange-600 mt-1">No students found for selected program</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalPoints">Total Points</Label>
          <Input
            id="totalPoints"
            type="number"
            value={formData.totalPoints}
            onChange={(e) => setFormData({ ...formData, totalPoints: parseInt(e.target.value) || 100 })}
            min="1"
            max="1000"
          />
        </div>

        <div>
          <Label htmlFor="dueDate">Due Date *</Label>
          <Input
            id="dueDate"
            type="datetime-local"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          id="allowLateSubmission"
          type="checkbox"
          checked={formData.allowLateSubmission}
          onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="allowLateSubmission">Allow late submissions</Label>
      </div>
    </div>
  );
};

export default function AssignmentManager({ teacherEmail, assignments, onAssignmentCreated, onAssignmentUpdated }: AssignmentManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [availablePrograms, setAvailablePrograms] = useState<string[]>([]);

  const [formData, setFormData] = useState<AssignmentFormData>({
    title: "",
    description: "",
    instructions: "",
    program: "",
    subject: "",
    dueDate: "",
    totalPoints: 100,
    allowLateSubmission: false,
    studentId: ""
  });

  // Fetch students on component mount
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`/api/teacher/students?teacherEmail=${encodeURIComponent(teacherEmail)}`);
        const data = await response.json();
        
        if (response.ok && data.students) {
          setStudents(data.students);
          
          // Get unique programs from students
          const programs = [...new Set(data.students.map((student: Student) => student.program))];
          setAvailablePrograms(programs as string[]);
        }
      } catch (error) {
        console.error('Error fetching students:', error);
      }
    };

    if (teacherEmail) {
      fetchStudents();
    }
  }, [teacherEmail]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      instructions: "",
      program: "",
      subject: "",
      dueDate: "",
      totalPoints: 100,
      allowLateSubmission: false,
      studentId: ""
    });
  };

  const handleCreate = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (assignment: Assignment) => {
    setFormData({
      title: assignment.title,
      description: assignment.description,
      instructions: assignment.instructions || "",
      program: assignment.program,
      subject: assignment.subject,
      dueDate: assignment.dueDate.split('T')[0], // Format for date input
      totalPoints: assignment.totalPoints,
      allowLateSubmission: assignment.allowLateSubmission,
      studentId: "" // For now, leave empty as existing assignments may not have student assignment
    });
    setEditingAssignment(assignment);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description || !formData.program || !formData.subject || !formData.dueDate || !formData.studentId) {
      alert("Please fill in all required fields including student selection");
      return;
    }

    setLoading(true);
    try {
      const url = editingAssignment 
        ? `/api/teacher/assignments`
        : `/api/teacher/assignments`;
      
      const method = editingAssignment ? 'PUT' : 'POST';
      
      const requestData = {
        ...formData,
        teacherEmail,
        ...(editingAssignment && { id: editingAssignment.id })
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save assignment');
      }

      // Close dialogs and reset form
      setIsCreateDialogOpen(false);
      setIsEditDialogOpen(false);
      setEditingAssignment(null);
      resetForm();

      // Refresh assignments
      if (editingAssignment) {
        onAssignmentUpdated();
      } else {
        onAssignmentCreated();
      }

      alert(data.message || 'Assignment saved successfully');

    } catch (error) {
      console.error('Error saving assignment:', error);
      alert(error instanceof Error ? error.message : 'Failed to save assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (assignmentId: number) => {
    if (!confirm('Are you sure you want to delete this assignment?')) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/assignments?id=${assignmentId}&teacherEmail=${encodeURIComponent(teacherEmail)}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete assignment');
      }

      onAssignmentUpdated();
      alert('Assignment deleted successfully');

    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert(error instanceof Error ? error.message : 'Failed to delete assignment');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assignment Management</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Assignment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Assignment</DialogTitle>
            </DialogHeader>
            <AssignmentForm 
              formData={formData}
              setFormData={setFormData}
              students={students}
              availablePrograms={availablePrograms}
            />
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Creating...' : 'Create Assignment'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Assignment List */}
      <div className="grid gap-4">
        {assignments.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium mb-2">No assignments yet</h3>
              <p className="text-gray-600 mb-4">Create your first assignment to get started</p>
              <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
            </CardContent>
          </Card>
        ) : (
          assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{assignment.title}</CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{assignment.subject}</Badge>
                      {assignment.targetStudent && (
                        <Badge variant="default" className="bg-blue-100 text-blue-800">
                          Assigned to: {assignment.targetStudent.name}
                        </Badge>
                      )}
                      {isOverdue(assignment.dueDate) && (
                        <Badge variant="destructive">Overdue</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(assignment)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(assignment.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{assignment.description}</p>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Due Date</p>
                      <p className="font-medium">{formatDate(assignment.dueDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Submissions</p>
                      <p className="font-medium">{assignment.submissions?.length || 0}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="font-medium">{assignment.totalPoints}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">Resources</p>
                      <p className="font-medium">{assignment.resources?.length || 0}</p>
                    </div>
                  </div>
                </div>

                {assignment.allowLateSubmission && (
                  <Badge variant="outline" className="text-xs">
                    Late submissions allowed
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Assignment</DialogTitle>
          </DialogHeader>
          <AssignmentForm 
            formData={formData}
            setFormData={setFormData}
            students={students}
            availablePrograms={availablePrograms}
          />
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Updating...' : 'Update Assignment'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Download,
  ExternalLink,
  FileText,
  Video,
  Image,
  Link as LinkIcon,
  Search,
  Filter,
  Clock,
  CheckCircle,
  User,
  Users
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

interface ResourceLibraryProps {
  studentEmail: string;
}

export default function ResourceLibrary({ studentEmail }: ResourceLibraryProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

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

  // Get resource icon
  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'document':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <Video className="h-5 w-5 text-red-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
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
      </Tabs>
    </div>
  );
}
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Toolbar, 
  ToolbarSearch, 
  ToolbarActions, 
  ToolbarSort, 
  ToolbarFilter 
} from '@/components/ui/toolbar';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Stethoscope,
  Award,
  Users,
  Clock
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  department: string;
  license: string;
  status: 'active' | 'inactive' | 'on_leave';
  experience: number;
  qualification: string;
  address?: string;
  emergencyContact?: string;
  patientCount?: number;
  lastLogin?: number;
  createdAt: number;
  updatedAt: number;
}

const specializations = [
  'Cardiology', 'Pediatrics', 'Gynecology', 'Orthopedics', 'Neurology',
  'Dermatology', 'Psychiatry', 'General Medicine', 'Surgery', 'Radiology'
];

const departments = [
  'Internal Medicine', 'Pediatrics', 'Obstetrics & Gynecology', 'Surgery',
  'Emergency Medicine', 'Radiology', 'Pathology', 'Anesthesiology', 'Oncology'
];

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    specialization: '',
    department: '',
    license: '',
    status: 'active' as 'active' | 'inactive' | 'on_leave',
    experience: 0,
    qualification: '',
    address: '',
    emergencyContact: ''
  });
  
  const { toast } = useToast();

  const loadDoctors = async () => {
    try {
      const response = await fetch('/api/doctors');
      if (response.ok) {
        const data = await response.json();
        setDoctors(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load doctors",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to load doctors:', error);
      toast({
        title: "Error",
        description: "Failed to load doctors",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingDoctor ? `/api/doctors/${editingDoctor.id}` : '/api/doctors';
      const method = editingDoctor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (result.ok) {
        toast({
          title: "Success",
          description: `Doctor ${editingDoctor ? 'updated' : 'created'} successfully`
        });
        setIsDialogOpen(false);
        setEditingDoctor(null);
        resetForm();
        loadDoctors();
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to save doctor',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save doctor",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name,
      email: doctor.email,
      phone: doctor.phone || '',
      specialization: doctor.specialization,
      department: doctor.department,
      license: doctor.license,
      status: doctor.status,
      experience: doctor.experience,
      qualification: doctor.qualification,
      address: doctor.address || '',
      emergencyContact: doctor.emergencyContact || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this doctor?')) return;
    
    try {
      const response = await fetch(`/api/doctors/${id}`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.ok) {
        toast({
          title: "Success",
          description: "Doctor deleted successfully"
        });
        loadDoctors();
      } else {
        toast({
          title: "Error",
          description: result.error || 'Failed to delete doctor',
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete doctor",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      specialization: '',
      department: '',
      license: '',
      status: 'active',
      experience: 0,
      qualification: '',
      address: '',
      emergencyContact: ''
    });
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || doctor.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || doctor.department === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'department':
        return a.department.localeCompare(b.department);
      case 'experience':
        return b.experience - a.experience;
      case 'patients':
        return (b.patientCount || 0) - (a.patientCount || 0);
      case 'lastLogin':
        return (b.lastLogin || 0) - (a.lastLogin || 0);
      default:
        return 0;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-600';
      case 'inactive': return 'bg-red-600';
      case 'on_leave': return 'bg-yellow-600';
      default: return 'bg-gray-400';
    }
  };

  const formatLastLogin = (timestamp?: number) => {
    if (!timestamp) return 'Never';
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours === 1) return '1 hour ago';
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return days === 1 ? '1 day ago' : `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading doctors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Doctor Management</h1>
        <p className="text-muted-foreground">
          Manage healthcare professionals and their information
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Doctors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{doctors.length}</div>
            <p className="text-xs text-muted-foreground">
              +{doctors.filter(d => Date.now() - d.createdAt < 2592000000).length} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {doctors.filter(d => d.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.round((doctors.filter(d => d.status === 'active').length / doctors.length) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(doctors.map(d => d.department)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              Different specializations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Experience</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(doctors.reduce((acc, d) => acc + d.experience, 0) / doctors.length) || 0} yrs
            </div>
            <p className="text-xs text-muted-foreground">
              Average years of experience
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Doctors Directory</CardTitle>
          <CardDescription>
            Manage doctor profiles, specializations, and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Toolbar */}
          <Toolbar className="mb-6">
            <ToolbarSearch
              placeholder="Search doctors, specializations, departments..."
              searchValue={searchTerm}
              onSearchChange={setSearchTerm}
            />
            
            <ToolbarFilter
              filters={[
                { key: 'all', label: 'All Status', active: statusFilter === 'all' },
                { key: 'active', label: 'Active', active: statusFilter === 'active' },
                { key: 'inactive', label: 'Inactive', active: statusFilter === 'inactive' },
                { key: 'on_leave', label: 'On Leave', active: statusFilter === 'on_leave' },
              ]}
              onFilterChange={(key, active) => active && setStatusFilter(key)}
            />
            
            <ToolbarSort
              sortOptions={[
                { key: 'name', label: 'Name' },
                { key: 'department', label: 'Department' },
                { key: 'experience', label: 'Experience' },
                { key: 'patients', label: 'Patient Count' },
                { key: 'lastLogin', label: 'Last Login' }
              ]}
              currentSort={sortBy}
              onSortChange={(key) => setSortBy(key)}
            />
            
            <ToolbarActions>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { resetForm(); setEditingDoctor(null); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Doctor
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
                    </DialogTitle>
                    <DialogDescription>
                      {editingDoctor ? 'Update doctor information' : 'Add a new doctor to the system'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="license">License Number *</Label>
                        <Input
                          id="license"
                          value={formData.license}
                          onChange={(e) => setFormData({...formData, license: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="specialization">Specialization *</Label>
                        <Select 
                          value={formData.specialization} 
                          onValueChange={(value) => setFormData({...formData, specialization: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            {specializations.map(spec => (
                              <SelectItem key={spec} value={spec}>{spec}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="department">Department *</Label>
                        <Select 
                          value={formData.department} 
                          onValueChange={(value) => setFormData({...formData, department: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map(dept => (
                              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="experience">Experience (years) *</Label>
                        <Input
                          id="experience"
                          type="number"
                          min="0"
                          max="50"
                          value={formData.experience}
                          onChange={(e) => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">Status</Label>
                        <Select 
                          value={formData.status} 
                          onValueChange={(value: 'active' | 'inactive' | 'on_leave') => setFormData({...formData, status: value})}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="on_leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="qualification">Qualification</Label>
                      <Input
                        id="qualification"
                        value={formData.qualification}
                        onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                        placeholder="e.g., MBBS, MD, MS"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                        placeholder="Full address"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                        placeholder="Emergency contact number"
                      />
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </ToolbarActions>
          </Toolbar>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Showing {sortedDoctors.length} of {doctors.length} doctors
            </p>
          </div>

          {/* Doctors Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialization</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Patients</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedDoctors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="text-muted-foreground">
                        <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        No doctors found matching your criteria
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedDoctors.map((doctor) => (
                    <TableRow key={doctor.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{doctor.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {doctor.email}
                            {doctor.phone && (
                              <>
                                <Phone className="h-3 w-3 ml-2" />
                                {doctor.phone}
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          {doctor.specialization}
                        </div>
                      </TableCell>
                      <TableCell>{doctor.department}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(doctor.status)} text-white border-transparent`}
                        >
                          {doctor.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>{doctor.experience} years</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {doctor.patientCount || 0}
                        </div>
                      </TableCell>
                      <TableCell>{formatLastLogin(doctor.lastLogin)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(doctor)}>
                              <Edit3 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(doctor.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { useState, useEffect } from "react";
import { 
  Wrench, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Phone,
  Plus,
  Loader2
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { useAuth } from "./AuthContext";
import { maintenanceApi, type MaintenanceTask } from "./services/api";
import { toast } from "sonner@2.0.3";

const upcomingSchedule = [
  {
    id: "1",
    title: "Plumber Visit",
    time: "2:00 PM Today",
    contractor: "Mike's Plumbing",
    phone: "(555) 123-4567"
  },
  {
    id: "2", 
    title: "HVAC Inspection",
    time: "Friday 10:00 AM",
    contractor: "Cool Air Pro",
    phone: "(555) 987-6543"
  }
];

// Mock tasks fallback for development
const mockTasks: MaintenanceTask[] = [
  {
    _id: "1",
    title: "Kitchen Faucet Leak",
    description: "Fixing dripping kitchen faucet",
    category: "plumbing",
    priority: "high",
    status: "scheduled",
    property: "property1",
    createdBy: "user1",
    estimatedCost: 150,
    dueDate: new Date().toISOString(),
    contractor: {
      name: "Mike's Plumbing",
      company: "Mike's Plumbing Services",
      phone: "(555) 123-4567",
      email: "mike@plumbing.com"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: "2",
    title: "HVAC Filter Replacement",
    description: "Replace air filters in HVAC system",
    category: "hvac",
    priority: "medium", 
    status: "pending",
    property: "property1",
    createdBy: "user1",
    estimatedCost: 45,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface NewTaskData {
  title: string;
  description: string;
  category: string;
  priority: string;
  dueDate: string;
  estimatedCost: string;
}

export function MaintenanceHelper() {
  const [activeTab, setActiveTab] = useState("tasks");
  const [tasks, setTasks] = useState<MaintenanceTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState<NewTaskData>({
    title: "",
    description: "",
    category: "general",
    priority: "medium",
    dueDate: "",
    estimatedCost: ""
  });
  const [submitting, setSubmitting] = useState(false);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadMaintenanceTasks();
    } else {
      // Use mock data when not authenticated
      setTasks(mockTasks);
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadMaintenanceTasks = async () => {
    try {
      setLoading(true);
      const response = await maintenanceApi.getTasks();
      setTasks(response.tasks || []);
    } catch (error) {
      console.error('Failed to load maintenance tasks, using fallback:', error);
      // Fallback to mock data
      setTasks(mockTasks);
      toast.error('Using demo data - connect to backend for live data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim() || !newTask.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!isAuthenticated) {
      toast.error("Please sign in to create maintenance tasks");
      return;
    }

    setSubmitting(true);
    try {
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        priority: newTask.priority as 'low' | 'medium' | 'high' | 'urgent',
        property: user?.savedProperties?.[0] || 'demo-property', // Use first saved property or demo
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        estimatedCost: newTask.estimatedCost ? parseFloat(newTask.estimatedCost) : undefined
      };

      const response = await maintenanceApi.createTask(taskData);
      
      if (response.task) {
        setTasks(prevTasks => [response.task, ...prevTasks]);
        setNewTask({
          title: "",
          description: "",
          category: "general",
          priority: "medium",
          dueDate: "",
          estimatedCost: ""
        });
        setShowAddTask(false);
        toast.success("Maintenance task created successfully");
      }
    } catch (error) {
      console.error('Failed to create task:', error);
      
      // Fallback: add to local state for demo
      const mockNewTask: MaintenanceTask = {
        _id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        category: newTask.category,
        priority: newTask.priority as 'low' | 'medium' | 'high' | 'urgent',
        status: 'pending',
        property: 'demo-property',
        createdBy: user?._id || user?.id || 'demo-user',
        estimatedCost: newTask.estimatedCost ? parseFloat(newTask.estimatedCost) : undefined,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate).toISOString() : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setTasks(prevTasks => [mockNewTask, ...prevTasks]);
      setNewTask({
        title: "",
        description: "",
        category: "general", 
        priority: "medium",
        dueDate: "",
        estimatedCost: ""
      });
      setShowAddTask(false);
      toast.success("Task created (demo mode - connect to backend for persistence)");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to update tasks");
      return;
    }

    try {
      await maintenanceApi.updateTask(taskId, { status: newStatus as any });
      
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { ...task, status: newStatus as any, updatedAt: new Date().toISOString() }
            : task
        )
      );
      
      toast.success("Task status updated");
    } catch (error) {
      console.error('Failed to update task:', error);
      
      // Fallback: update local state for demo
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId 
            ? { ...task, status: newStatus as any, updatedAt: new Date().toISOString() }
            : task
        )
      );
      
      toast.success("Task updated (demo mode)");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": 
      case "urgent": 
        return "bg-red-100 text-red-800 border-red-200";
      case "medium": 
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low": 
        return "bg-green-100 text-green-800 border-green-200";
      default: 
        return "bg-warm-gray-100 text-warm-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return CheckCircle;
      case "in-progress": return Clock;
      case "scheduled": return Calendar;
      default: return AlertTriangle;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-600";
      case "in-progress": return "text-blue-600";
      case "scheduled": return "text-teal-600";
      default: return "text-orange-600";
    }
  };

  const totalCosts = tasks.reduce((sum, task) => {
    return sum + (task.estimatedCost || 0);
  }, 0);

  const completedTasks = tasks.filter(task => task.status === "completed").length;
  const progressPercentage = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Not set";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays > 1) return `In ${diffDays} days`;
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
    
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-teal-600" />
          Maintenance Helper
          {!isAuthenticated && (
            <Badge variant="outline" className="text-xs">
              Demo Mode
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-teal-600" />
            <span className="ml-2 text-sm text-warm-gray-600">Loading tasks...</span>
          </div>
        ) : (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-2 bg-warm-gray-50 rounded">
                <div className="font-bold text-warm-gray-900">{tasks.length}</div>
                <div className="text-xs text-warm-gray-600">Tasks</div>
              </div>
              <div className="text-center p-2 bg-teal-50 rounded">
                <div className="font-bold text-teal-600">${totalCosts.toLocaleString()}</div>
                <div className="text-xs text-warm-gray-600">Est. Cost</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-bold text-green-600">{completedTasks}</div>
                <div className="text-xs text-warm-gray-600">Completed</div>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-warm-gray-600">Overall Progress</span>
                <span className="font-medium">{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="tasks">Tasks</TabsTrigger>
                <TabsTrigger value="schedule">Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="tasks" className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-warm-gray-900">Maintenance Tasks</span>
                  
                  <Dialog open={showAddTask} onOpenChange={setShowAddTask}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Add Maintenance Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Task Title</Label>
                          <Input
                            id="title"
                            placeholder="Enter task title"
                            value={newTask.title}
                            onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe the maintenance task"
                            value={newTask.description}
                            onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="category">Category</Label>
                            <Select value={newTask.category} onValueChange={(value) => setNewTask(prev => ({ ...prev, category: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="plumbing">Plumbing</SelectItem>
                                <SelectItem value="electrical">Electrical</SelectItem>
                                <SelectItem value="hvac">HVAC</SelectItem>
                                <SelectItem value="general">General</SelectItem>
                                <SelectItem value="appliance">Appliance</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="priority">Priority</Label>
                            <Select value={newTask.priority} onValueChange={(value) => setNewTask(prev => ({ ...prev, priority: value }))}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="dueDate">Due Date</Label>
                            <Input
                              id="dueDate"
                              type="date"
                              value={newTask.dueDate}
                              onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="cost">Est. Cost ($)</Label>
                            <Input
                              id="cost"
                              type="number"
                              placeholder="0"
                              value={newTask.estimatedCost}
                              onChange={(e) => setNewTask(prev => ({ ...prev, estimatedCost: e.target.value }))}
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            onClick={() => setShowAddTask(false)}
                            className="flex-1"
                          >
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleCreateTask}
                            disabled={submitting}
                            className="flex-1 bg-teal-500 hover:bg-teal-600"
                          >
                            {submitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Create Task"
                            )}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {tasks.map((task) => {
                    const StatusIcon = getStatusIcon(task.status);
                    
                    return (
                      <div key={task._id} className="border border-warm-gray-200 rounded-lg p-3">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-warm-gray-900 text-sm">
                              {task.title}
                            </h4>
                            <p className="text-xs text-warm-gray-600 mt-1">
                              {task.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusIcon className={`h-4 w-4 ${getStatusColor(task.status)}`} />
                            {task.status !== 'completed' && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-6 px-2 text-xs"
                                onClick={() => handleUpdateTaskStatus(task._id, 'completed')}
                              >
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getPriorityColor(task.priority)}`}
                            >
                              {task.priority}
                            </Badge>
                            <span className="text-xs text-warm-gray-500">
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                          {task.estimatedCost && (
                            <div className="text-sm font-medium text-teal-600">
                              ${task.estimatedCost.toLocaleString()}
                            </div>
                          )}
                        </div>
                        
                        {task.contractor && (
                          <div className="text-xs text-warm-gray-600 mt-1">
                            Contractor: {task.contractor.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {tasks.length === 0 && (
                    <div className="text-center py-8 text-warm-gray-500">
                      <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No maintenance tasks yet</p>
                      <p className="text-xs">Add your first task to get started</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="schedule" className="space-y-3 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-warm-gray-900">Upcoming Appointments</span>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-3 w-3 mr-1" />
                    Book
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {upcomingSchedule.map((appointment) => (
                    <div key={appointment.id} className="border border-warm-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-warm-gray-900 text-sm">
                          {appointment.title}
                        </h4>
                        <Badge className="bg-teal-100 text-teal-800 text-xs">
                          Scheduled
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-warm-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {appointment.time}
                        </div>
                        <div>{appointment.contractor}</div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {appointment.phone}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Emergency Contact */}
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-900 text-sm">Emergency</span>
              </div>
              <p className="text-xs text-red-700 mb-2">
                For urgent repairs, contact emergency maintenance
              </p>
              <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-50">
                <Phone className="h-3 w-3 mr-1" />
                Call Now
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  FileText,
  Users,
  PieChart,
  Calendar
} from "lucide-react";
import { useState } from "react";

const Dashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("month");

  const metrics = [
    {
      title: "Gastos Totales",
      value: "$24,580",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "Gastos Pendientes",
      value: "$8,430",
      change: "23 reportes",
      icon: Clock,
      trend: "neutral"
    },
    {
      title: "Aprobados Hoy",
      value: "$5,280",
      change: "+8.1%",
      icon: CheckCircle,
      trend: "up"
    },
    {
      title: "Rechazados",
      value: "$1,120",
      change: "3 reportes",
      icon: XCircle,
      trend: "down"
    }
  ];

  const recentExpenses = [
    {
      id: "EXP-001",
      description: "Comida cliente - Reunión Q4",
      amount: "$125.50",
      category: "Comidas",
      status: "pending",
      date: "2024-01-15",
      employee: "Juan Pérez"
    },
    {
      id: "EXP-002", 
      description: "Vuelo Madrid-Barcelona",
      amount: "$280.00",
      category: "Viajes",
      status: "approved",
      date: "2024-01-14",
      employee: "María García"
    },
    {
      id: "EXP-003",
      description: "Material oficina",
      amount: "$89.30",
      category: "Suministros",
      status: "rejected",
      date: "2024-01-14",
      employee: "Carlos López"
    },
    {
      id: "EXP-004",
      description: "Taxi aeropuerto",
      amount: "$45.20",
      category: "Transporte",
      status: "pending",
      date: "2024-01-13",
      employee: "Ana Martín"
    }
  ];

  const budgetData = [
    { department: "Ventas", used: 75, budget: 10000, spent: 7500 },
    { department: "Marketing", used: 60, budget: 8000, spent: 4800 },
    { department: "IT", used: 45, budget: 12000, spent: 5400 },
    { department: "RRHH", used: 30, budget: 5000, spent: 1500 }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'pending': return 'warning';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'pending': return 'Pendiente';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard de Gastos</h1>
            <p className="text-muted-foreground mt-1">Gestión integral de gastos empresariales</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant={selectedPeriod === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("week")}
            >
              Semana
            </Button>
            <Button 
              variant={selectedPeriod === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("month")}
            >
              Mes
            </Button>
            <Button 
              variant={selectedPeriod === "quarter" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPeriod("quarter")}
            >
              Trimestre
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => (
            <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-gradient-card">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
                    <p className={`text-xs mt-1 ${
                      metric.trend === 'up' ? 'text-success' : 
                      metric.trend === 'down' ? 'text-destructive' : 'text-muted-foreground'
                    }`}>
                      {metric.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${
                    metric.trend === 'up' ? 'bg-success/10 text-success' :
                    metric.trend === 'down' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                  }`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Expenses */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Gastos Recientes
                  </CardTitle>
                  <Button variant="outline" size="sm">
                    Ver Todos
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-muted-foreground">{expense.id}</span>
                          <Badge variant={getStatusColor(expense.status)} className="text-xs">
                            {getStatusText(expense.status)}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-foreground">{expense.description}</h4>
                        <p className="text-sm text-muted-foreground">
                          {expense.employee} • {expense.category} • {expense.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{expense.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Budget Overview */}
          <div>
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-primary" />
                  Presupuesto por Departamento
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {budgetData.map((dept, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{dept.department}</span>
                      <span className="text-muted-foreground">
                        ${dept.spent.toLocaleString()} / ${dept.budget.toLocaleString()}
                      </span>
                    </div>
                    <Progress 
                      value={dept.used} 
                      className={`h-2 ${dept.used > 80 ? '[&>div]:bg-destructive' : dept.used > 60 ? '[&>div]:bg-warning' : '[&>div]:bg-success'}`}
                    />
                    <p className="text-xs text-muted-foreground">{dept.used}% utilizado</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-md mt-6">
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Nuevo Gasto
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Revisar Pendientes
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Generar Reporte
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Calendario
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Alerts */}
        <Card className="border-0 shadow-md border-l-4 border-l-warning">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <h4 className="font-medium text-foreground">Atención Requerida</h4>
                <p className="text-sm text-muted-foreground">
                  Hay 5 gastos pendientes de aprobación desde hace más de 3 días. 
                  El departamento de Ventas está cerca del límite presupuestario (75%).
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
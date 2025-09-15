import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  MessageSquare, 
  User, 
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  Download,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const ApprovalFlow = () => {
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");

  const pendingExpenses = [
    {
      id: "EXP-001",
      employee: {
        name: "Juan Pérez",
        avatar: null,
        department: "Ventas"
      },
      description: "Comida cliente - Reunión Q4 proyecto Alpha",
      amount: 125.50,
      category: "Comidas",
      project: "Proyecto Alpha",
      date: "2024-01-15",
      submittedDate: "2024-01-15T10:30:00",
      attachments: ["ticket_restaurante.pdf", "foto_recibo.jpg"],
      status: "pending_supervisor",
      priority: "normal",
      notes: "Reunión importante con cliente potencial para cerrar contrato Q4",
      approvalLevel: 1,
      totalLevels: 1
    },
    {
      id: "EXP-002",
      employee: {
        name: "María García",
        avatar: null,
        department: "Marketing"
      },
      description: "Vuelo Madrid-Barcelona - Conferencia Marketing",
      amount: 280.00,
      category: "Viajes",
      project: "Marketing Digital",
      date: "2024-01-12",
      submittedDate: "2024-01-14T09:15:00",
      attachments: ["boarding_pass.pdf", "invoice_airline.pdf"],
      status: "pending_supervisor",
      priority: "urgent",
      notes: "Participación en conferencia de marketing digital, presentación de nuevos productos",
      approvalLevel: 1,
      totalLevels: 1
    },
    {
      id: "EXP-003",
      employee: {
        name: "Carlos López",
        avatar: null,
        department: "IT"
      },
      description: "Software Adobe Creative Suite - Licencia anual",
      amount: 680.00,
      category: "Software",
      project: "Sin Proyecto",
      date: "2024-01-10",
      submittedDate: "2024-01-13T14:22:00",
      attachments: ["adobe_invoice.pdf"],
      status: "pending_finance",
      priority: "normal",
      notes: "Renovación licencia necesaria para el departamento de diseño",
      approvalLevel: 2,
      totalLevels: 2
    }
  ];

  const approvedExpenses = [
    {
      id: "EXP-004",
      employee: {
        name: "Ana Martín",
        avatar: null,
        department: "RRHH"
      },
      description: "Taxi aeropuerto - Viaje formación",
      amount: 45.20,
      category: "Transporte",
      date: "2024-01-08",
      approvedBy: "Ana Martínez",
      approvedDate: "2024-01-14T16:30:00",
      status: "approved"
    }
  ];

  const rejectedExpenses = [
    {
      id: "EXP-005",
      employee: {
        name: "Pedro Ruiz",
        avatar: null,
        department: "Ventas"
      },
      description: "Cena personal - Sin justificación empresarial",
      amount: 89.30,
      category: "Comidas",
      date: "2024-01-05",
      rejectedBy: "Ana Martínez",
      rejectedDate: "2024-01-12T11:45:00",
      rejectionReason: "No se ha proporcionado justificación empresarial válida. La cena parece de carácter personal.",
      status: "rejected"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_supervisor':
      case 'pending_finance':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_supervisor':
        return 'Pendiente Supervisor';
      case 'pending_finance':
        return 'Pendiente Finanzas';
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      case 'normal': return 'secondary';
      default: return 'secondary';
    }
  };

  const handleApprove = (expenseId: string) => {
    console.log(`Aprobando gasto ${expenseId} con motivo: ${actionReason}`);
    setActionReason("");
    setSelectedExpense(null);
  };

  const handleReject = (expenseId: string) => {
    console.log(`Rechazando gasto ${expenseId} con motivo: ${actionReason}`);
    setActionReason("");
    setSelectedExpense(null);
  };

  const ExpenseCard = ({ expense, showActions = false }: { expense: any, showActions?: boolean }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={expense.employee.avatar} />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {expense.employee.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground">{expense.employee.name}</h3>
                <p className="text-sm text-muted-foreground">{expense.employee.department}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {expense.priority && (
                <Badge variant={getPriorityColor(expense.priority)} className="text-xs">
                  {expense.priority === 'urgent' ? 'Urgente' : 
                   expense.priority === 'high' ? 'Alta' : 'Normal'}
                </Badge>
              )}
              <Badge variant={getStatusColor(expense.status)}>
                {getStatusText(expense.status)}
              </Badge>
            </div>
          </div>

          {/* Expense Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">ID:</span>
              <span className="text-sm font-medium">{expense.id}</span>
            </div>
            <h4 className="font-medium text-lg text-foreground">{expense.description}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-foreground text-lg">€{expense.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(expense.date), "dd MMM yyyy", { locale: es })}</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Categoría:</span>
              <p>{expense.category}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Proyecto:</span>
              <p>{expense.project || 'Sin proyecto'}</p>
            </div>
          </div>

          {/* Notes */}
          {expense.notes && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Notas:</span>
              <p className="text-sm mt-1">{expense.notes}</p>
            </div>
          )}

          {/* Approval Flow */}
          {expense.approvalLevel && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Nivel de aprobación:</span>
              <Badge variant="outline">
                {expense.approvalLevel} de {expense.totalLevels}
              </Badge>
            </div>
          )}

          {/* Attachments */}
          {expense.attachments && expense.attachments.length > 0 && (
            <div>
              <span className="text-sm font-medium text-muted-foreground">Adjuntos:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {expense.attachments.map((attachment: string, index: number) => (
                  <Button key={index} variant="outline" size="sm" className="h-8 text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    {attachment}
                    <Download className="h-3 w-3 ml-1" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Rejection Reason */}
          {expense.rejectionReason && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-destructive">Motivo de rechazo:</span>
                  <p className="text-sm text-destructive/80 mt-1">{expense.rejectionReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="pt-4 border-t">
              {selectedExpense === expense.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="reason">Comentario/Motivo (opcional)</Label>
                    <Textarea
                      id="reason"
                      placeholder="Añade un comentario o motivo para tu decisión..."
                      value={actionReason}
                      onChange={(e) => setActionReason(e.target.value)}
                      rows={2}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      className="flex-1" 
                      onClick={() => handleApprove(expense.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Aprobar
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1"
                      onClick={() => handleReject(expense.id)}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Rechazar
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => setSelectedExpense(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setSelectedExpense(expense.id)}
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Revisar
                  </Button>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Approval/Rejection Info */}
          {expense.approvedBy && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>Aprobado por {expense.approvedBy} el {format(new Date(expense.approvedDate), "dd/MM/yyyy 'a las' HH:mm")}</span>
            </div>
          )}
          
          {expense.rejectedBy && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              <span>Rechazado por {expense.rejectedBy} el {format(new Date(expense.rejectedDate), "dd/MM/yyyy 'a las' HH:mm")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flujo de Aprobaciones</h1>
            <p className="text-muted-foreground mt-1">Gestiona las solicitudes de gastos pendientes</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning/10 text-warning rounded-lg">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                  <p className="text-xl font-bold text-foreground">{pendingExpenses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-success/10 text-success rounded-lg">
                  <CheckCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Aprobados Hoy</p>
                  <p className="text-xl font-bold text-foreground">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-destructive/10 text-destructive rounded-lg">
                  <XCircle className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rechazados</p>
                  <p className="text-xl font-bold text-foreground">3</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revisado</p>
                  <p className="text-xl font-bold text-foreground">€2,840</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes ({pendingExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprobados
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rechazados
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4 mt-6">
            {pendingExpenses.length > 0 ? (
              <div className="grid gap-6">
                {pendingExpenses.map((expense) => (
                  <ExpenseCard 
                    key={expense.id} 
                    expense={expense} 
                    showActions={true}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
                  <h3 className="text-lg font-medium mb-2">¡Todo al día!</h3>
                  <p className="text-muted-foreground">No hay gastos pendientes de aprobación en este momento.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            <div className="grid gap-6">
              {approvedExpenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            <div className="grid gap-6">
              {rejectedExpenses.map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApprovalFlow;
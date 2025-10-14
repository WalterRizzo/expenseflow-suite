import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  MessageSquare, 
  Calendar,
  DollarSign,
  FileText,
  Download,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface UserProfile {
  full_name: string;
  email: string;
}

interface Expense {
  id: string;
  amount: number;
  description: string;
  category: string;
  project: string | null;
  notes: string | null;
  expense_date: string;
  status: string;
  priority: string;
  user_id: string;
  approved_by: string | null;
  approved_at: string | null;
  rejected_by: string | null;
  rejected_at: string | null;
  rejection_reason: string | null;
  user_profile?: UserProfile;
}

const ApprovalFlow = () => {
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserId(user.id);
    }
  };

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const { data: expensesData, error } = await supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener perfiles para cada gasto
      const expensesWithProfiles = await Promise.all(
        (expensesData || []).map(async (expense) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', expense.user_id)
            .single();

          return {
            ...expense,
            user_profile: profile || { full_name: 'Usuario Desconocido', email: '' }
          };
        })
      );

      setExpenses(expensesWithProfiles);
    } catch (error: any) {
      toast.error("Error cargando gastos: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId: string) => {
    if (!currentUserId) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'approved',
          approved_by: currentUserId,
          approved_at: new Date().toISOString(),
        })
        .eq('id', expenseId);

      if (error) throw error;

      toast.success("Gasto aprobado correctamente");
      setActionReason("");
      setSelectedExpense(null);
      fetchExpenses();
    } catch (error: any) {
      toast.error("Error aprobando gasto: " + error.message);
    }
  };

  const handleReject = async (expenseId: string) => {
    if (!currentUserId) return;
    if (!actionReason) {
      toast.error("Por favor proporciona un motivo de rechazo");
      return;
    }

    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          status: 'rejected',
          rejected_by: currentUserId,
          rejected_at: new Date().toISOString(),
          rejection_reason: actionReason,
        })
        .eq('id', expenseId);

      if (error) throw error;

      toast.success("Gasto rechazado");
      setActionReason("");
      setSelectedExpense(null);
      fetchExpenses();
    } catch (error: any) {
      toast.error("Error rechazando gasto: " + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'destructive';
      case 'draft': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      case 'draft': return 'Borrador';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      meals: 'Comidas',
      travel: 'Viajes',
      transport: 'Transporte',
      supplies: 'Suministros',
      software: 'Software',
      training: 'Formación',
      other: 'Otros'
    };
    return categories[category] || category;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'destructive';
      case 'high': return 'warning';
      case 'normal': return 'secondary';
      default: return 'secondary';
    }
  };

  const ExpenseCard = ({ expense, showActions = false }: { expense: Expense, showActions?: boolean }) => (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {expense.user_profile?.full_name.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium text-foreground">{expense.user_profile?.full_name || 'Usuario Desconocido'}</h3>
                <p className="text-sm text-muted-foreground">{expense.user_profile?.email || ''}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getPriorityColor(expense.priority)} className="text-xs">
                {expense.priority === 'urgent' ? 'Urgente' : 
                 expense.priority === 'high' ? 'Alta' : 'Normal'}
              </Badge>
              <Badge variant={getStatusColor(expense.status)}>
                {getStatusText(expense.status)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium text-lg text-foreground">{expense.description}</h4>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4" />
                <span className="font-medium text-foreground text-lg">€{expense.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(expense.expense_date), "dd MMM yyyy", { locale: es })}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Categoría:</span>
              <p>{getCategoryText(expense.category)}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Proyecto:</span>
              <p>{expense.project || 'Sin proyecto'}</p>
            </div>
          </div>

          {expense.notes && (
            <div className="p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Notas:</span>
              <p className="text-sm mt-1">{expense.notes}</p>
            </div>
          )}

          {expense.rejection_reason && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive mt-0.5" />
                <div>
                  <span className="text-sm font-medium text-destructive">Motivo de rechazo:</span>
                  <p className="text-sm text-destructive/80 mt-1">{expense.rejection_reason}</p>
                </div>
              </div>
            </div>
          )}

          {showActions && expense.status === 'pending' && (
            <div className="pt-4 border-t">
              {selectedExpense === expense.id ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="reason">Comentario/Motivo</Label>
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
                      onClick={() => {
                        setSelectedExpense(null);
                        setActionReason("");
                      }}
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
                </div>
              )}
            </div>
          )}

          {expense.approved_at && (
            <div className="flex items-center gap-2 text-sm text-success">
              <CheckCircle className="h-4 w-4" />
              <span>Aprobado el {format(new Date(expense.approved_at), "dd/MM/yyyy 'a las' HH:mm")}</span>
            </div>
          )}
          
          {expense.rejected_at && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <XCircle className="h-4 w-4" />
              <span>Rechazado el {format(new Date(expense.rejected_at), "dd/MM/yyyy 'a las' HH:mm")}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const pendingExpenses = expenses.filter(e => e.status === 'pending');
  const approvedExpenses = expenses.filter(e => e.status === 'approved');
  const rejectedExpenses = expenses.filter(e => e.status === 'rejected');

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <p className="text-muted-foreground">Cargando gastos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Flujo de Aprobaciones</h1>
            <p className="text-muted-foreground mt-1">Gestiona las solicitudes de gastos</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Aprobados</p>
                  <p className="text-xl font-bold text-foreground">{approvedExpenses.length}</p>
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
                  <p className="text-xl font-bold text-foreground">{rejectedExpenses.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-foreground">
                    €{expenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pendientes ({pendingExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Aprobados ({approvedExpenses.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rechazados ({rejectedExpenses.length})
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
                  <p className="text-muted-foreground">No hay gastos pendientes de aprobación</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4 mt-6">
            {approvedExpenses.length > 0 ? (
              <div className="grid gap-6">
                {approvedExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No hay gastos aprobados aún</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4 mt-6">
            {rejectedExpenses.length > 0 ? (
              <div className="grid gap-6">
                {rejectedExpenses.map((expense) => (
                  <ExpenseCard key={expense.id} expense={expense} />
                ))}
              </div>
            ) : (
              <Card className="border-0 shadow-md">
                <CardContent className="p-12 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-success mb-4" />
                  <p className="text-muted-foreground">No hay gastos rechazados</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApprovalFlow;

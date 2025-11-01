import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Calendar as CalendarIcon, 
  FileText, 
  DollarSign, 
  Tag, 
  User,
  AlertCircle,
  CheckCircle,
  X,
  Eye
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const ExpenseForm = () => {
  const [date, setDate] = useState<Date>();
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'pdf' | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [supervisorName, setSupervisorName] = useState<string>("No asignado");
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "",
    project: "",
    notes: "",
    currency: "ARS",
    exchangeRate: "1.0"
  });

  useEffect(() => {
    const loadSupervisor = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('supervisor_id')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.supervisor_id) {
        const { data: supervisor } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', profile.supervisor_id)
          .maybeSingle();
        
        if (supervisor) {
          setSupervisorName(supervisor.full_name || supervisor.email);
        }
      }
    };
    loadSupervisor();
  }, []);

  const currencies = [
    { value: "ARS", label: "Peso Argentino (ARS)", rate: 1.0 },
    { value: "USD", label: "Dólar (USD)", rate: 1000.0 },
    { value: "EUR", label: "Euro (EUR)", rate: 1100.0 },
    { value: "BRL", label: "Real (BRL)", rate: 200.0 }
  ];

  const categories = [
    { value: "meals", label: "Comidas y Entretenimiento", limit: 500 },
    { value: "travel", label: "Viajes y Alojamiento", limit: 2000 },
    { value: "transport", label: "Transporte", limit: 300 },
    { value: "supplies", label: "Suministros de Oficina", limit: 200 },
    { value: "software", label: "Software y Licencias", limit: 1000 },
    { value: "training", label: "Formación", limit: 800 }
  ];

  const projects = [
    "Proyecto Alpha", 
    "Proyecto Beta", 
    "Operaciones Q1", 
    "Marketing Digital",
    "Sin Proyecto"
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(event.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return '🖼️';
    } else if (extension === 'pdf') {
      return '📄';
    }
    return '📎';
  };

  const selectedCategory = categories.find(cat => cat.value === formData.category);
  const amountValue = parseFloat(formData.amount) || 0;
  const isOverLimit = selectedCategory && amountValue > selectedCategory.limit;

  const { toast } = useToast();
  const navigate = useNavigate();

  const validateForm = () => {
    return formData.amount && 
           formData.description && 
           formData.category && 
           date && 
           files.length > 0;
  };

  const handleSubmit = async (status: 'pending' | 'draft') => {
    if (!validateForm() && status === 'pending') {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Subir archivos a storage
    const uploadedFiles = [];
    for (const file of files) {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('expense-attachments')
        .upload(filePath, file);
      
      if (uploadError) {
        toast({
          title: "Error",
          description: "No se pudo subir el archivo: " + file.name,
          variant: "destructive"
        });
        return;
      }
      uploadedFiles.push({ name: file.name, path: filePath, size: file.size, type: file.type });
    }

    const { error } = await supabase
      .from('expenses')
      .insert({
        user_id: user.id,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        exchange_rate: parseFloat(formData.exchangeRate),
        description: formData.description,
        category: formData.category as any,
        project: formData.project || null,
        notes: formData.notes || null,
        expense_date: date?.toISOString().split('T')[0] || '',
        status: status as any,
        attachments: uploadedFiles as any
      });

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo guardar el gasto",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Éxito",
        description: status === 'pending' ? "Gasto enviado para aprobación" : "Borrador guardado"
      });
      navigate('/expenses');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Nuevo Reporte de Gastos</h1>
          <p className="text-muted-foreground mt-1">Completa todos los campos requeridos para enviar tu gasto</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Información del Gasto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount" className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      Importe *
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="text-lg font-medium"
                    />
                    {formData.amount && (
                      <p className="text-sm text-muted-foreground">
                        En pesos: ${(parseFloat(formData.amount) * parseFloat(formData.exchangeRate)).toFixed(2)} ARS
                      </p>
                    )}
                    {isOverLimit && (
                      <div className="flex items-center gap-1 text-warning text-sm">
                        <AlertCircle className="h-4 w-4" />
                        Excede el límite de ${selectedCategory?.limit}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Moneda *
                    </Label>
                    <Select value={formData.currency} onValueChange={(value) => {
                      const selectedCurrency = currencies.find(c => c.value === value);
                      setFormData(prev => ({ 
                        ...prev, 
                        currency: value,
                        exchangeRate: selectedCurrency?.rate.toString() || "1.0"
                      }));
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar moneda" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.value} value={currency.value}>
                            {currency.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <CalendarIcon className="h-4 w-4" />
                    Fecha del Gasto *
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: es }) : "Seleccionar fecha"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        className="p-3 pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Descripción del Gasto *
                  </Label>
                  <Input
                    id="description"
                    placeholder="ej. Comida con cliente, Vuelo a Madrid, Material de oficina..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Tag className="h-4 w-4" />
                      Categoría *
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            <div className="flex justify-between items-center w-full">
                              <span>{category.label}</span>
                              <Badge variant="secondary" className="ml-2 text-xs">
                                Límite: ${category.limit}
                              </Badge>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      Proyecto
                    </Label>
                    <Select value={formData.project} onValueChange={(value) => setFormData(prev => ({ ...prev, project: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem key={project} value={project}>
                            {project}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">
                    Notas Adicionales
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Información adicional sobre el gasto (opcional)"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* File Upload */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Adjuntos (Tickets, Facturas) *
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                    dragOver ? "border-primary bg-primary/5" : "border-border",
                    "hover:border-primary hover:bg-muted/30"
                  )}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="font-medium">Arrastra archivos aquí o</p>
                    <Label htmlFor="file-upload" className="cursor-pointer">
                      <Button variant="outline" asChild>
                        <span>Seleccionar Archivos</span>
                      </Button>
                      <Input
                        id="file-upload"
                        type="file"
                        multiple
                        accept="image/*,.pdf"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    PDF, JPG, PNG - Máximo 10MB por archivo
                  </p>
                </div>

                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="font-medium text-sm">Archivos Adjuntos:</h4>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{getFileIcon(file.name)}</span>
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(file.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm" onClick={() => {
                            const url = URL.createObjectURL(file);
                            setPreviewUrl(url);
                            setPreviewName(file.name);
                            const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                            setPreviewType(isPdf ? 'pdf' : 'image');
                          }}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Policy Check */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Verificación de Políticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {selectedCategory ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Categoría válida</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {!isOverLimit && amountValue > 0 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-warning" />
                  )}
                  <span className="text-sm">Límite de gasto</span>
                </div>
                
                <div className="flex items-center gap-2">
                  {files.length > 0 ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Comprobantes adjuntos</span>
                </div>

                <div className="flex items-center gap-2">
                  {date ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm">Fecha válida</span>
                </div>
              </CardContent>
            </Card>

            {/* Approval Flow Preview */}
            <Card className="border-0 shadow-md">
              <CardHeader>
                <CardTitle className="text-lg">Flujo de Aprobación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-sm">Supervisor Directo</p>
                      <p className="text-xs text-muted-foreground">{supervisorName}</p>
                    </div>
                  </div>
                  
                  {amountValue > 500 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                        2
                      </div>
                      <div>
                        <p className="font-medium text-sm">Director Financiero</p>
                        <p className="text-xs text-muted-foreground">Carlos Rodríguez</p>
                      </div>
                    </div>
                  )}
                  
                  {amountValue > 1000 && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-sm font-medium">
                        3
                      </div>
                      <div>
                        <p className="font-medium text-sm">Director General</p>
                        <p className="text-xs text-muted-foreground">María López</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-muted-foreground mt-4 p-2 bg-muted/30 rounded">
                  {amountValue > 1000 
                    ? "Requiere 3 aprobaciones (>1000€)" 
                    : amountValue > 500 
                    ? "Requiere 2 aprobaciones (>500€)"
                    : "Requiere 1 aprobación"}
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button 
                className="w-full" 
                disabled={!validateForm()}
                size="lg"
                onClick={() => handleSubmit('pending')}
              >
                Enviar para Aprobación
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => handleSubmit('draft')}
              >
                Guardar Borrador
              </Button>
              
              <Button variant="ghost" className="w-full">
                Cancelar
              </Button>
            </div>

            {/* Help */}
            <Card className="border-0 shadow-md border-l-4 border-l-primary">
              <CardContent className="p-4">
                <h4 className="font-medium text-sm mb-2">💡 Consejos</h4>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Incluye siempre el ticket original</li>
                  <li>• Describe claramente el motivo</li>
                  <li>• Revisa los límites por categoría</li>
                  <li>• Envía dentro de 30 días</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Vista previa de archivos */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => {
        if (!open && previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
          setPreviewType(null);
          setPreviewName("");
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Vista previa: {previewName}</DialogTitle>
          </DialogHeader>
          {previewType === 'image' && previewUrl && (
            <img src={previewUrl} alt={`Vista previa ${previewName}`} className="w-full h-auto rounded-md" />
          )}
          {previewType === 'pdf' && previewUrl && (
            <iframe src={previewUrl} className="w-full h-[70vh]" />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExpenseForm;
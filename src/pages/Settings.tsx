import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, User, Bell, Lock, Database, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
}

interface UserRoleRow {
  role: string;
}

const Settings = () => {
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    full_name: "",
    email: ""
  });
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [allProfiles, setAllProfiles] = useState<UserProfile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string>>({});
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    approvals: true
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Mi perfil
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile({
        full_name: data.full_name || "",
        email: data.email || ""
      });
    }

    // Rol del usuario actual
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle();
    const role = roleData?.role || 'user';
    setCurrentUserRole(role);

    // Si es supervisor o admin, cargar todos los perfiles
    if (role === 'supervisor' || role === 'admin') {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });
      setAllProfiles(profiles || []);

      // Cargar roles de todos
      const { data: allRoles } = await supabase
        .from('user_roles')
        .select('user_id, role');
      const rolesMap: Record<string, string> = {};
      (allRoles || []).forEach((r: any) => {
        rolesMap[r.user_id] = r.role;
      });
      setUserRoles(rolesMap);
    }
  };

  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ full_name: profile.full_name })
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Éxito",
        description: "Perfil actualizado correctamente"
      });
    }
  };

  const handleChangeUserRole = async (userId: string, newRole: 'admin' | 'supervisor' | 'user' | 'carga') => {
    // Intentar actualizar o insertar el rol
    const { data: existingRole } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    let error: any;
    if (existingRole) {
      const res = await supabase
        .from('user_roles')
        .update({ role: newRole as any })
        .eq('user_id', userId);
      error = res.error;
    } else {
      const res = await supabase
        .from('user_roles')
        .insert([{ user_id: userId, role: newRole as any }]);
      error = res.error;
    }

    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el rol: " + error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Éxito",
        description: "Rol actualizado correctamente"
      });
      setUserRoles(prev => ({ ...prev, [userId]: newRole }));
    }
  };

  const isSupervisorOrAdmin = currentUserRole === 'supervisor' || currentUserRole === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Configuración</h1>
          <p className="text-muted-foreground mt-1">Gestiona tu cuenta y preferencias</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Perfil de Usuario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input
                id="name"
                value={profile.full_name}
                onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={profile.email}
                disabled
              />
            </div>
            <Button onClick={handleSaveProfile}>Guardar Cambios</Button>
          </CardContent>
        </Card>

        {isSupervisorOrAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Gestión de Usuarios (Supervisor)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {allProfiles.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{p.full_name || 'Sin nombre'}</p>
                    <p className="text-sm text-muted-foreground">{p.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Rol:</span>
                    <Select
                      value={userRoles[p.id] || 'user'}
                      onValueChange={(val) => handleChangeUserRole(p.id, val as 'admin' | 'supervisor' | 'user' | 'carga')}
                    >
                      <SelectTrigger className="w-36">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notificaciones
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones por Email</p>
                <p className="text-sm text-muted-foreground">Recibe actualizaciones por correo</p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, email: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notificaciones Push</p>
                <p className="text-sm text-muted-foreground">Notificaciones en el navegador</p>
              </div>
              <Switch
                checked={notifications.push}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, push: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Alertas de Aprobación</p>
                <p className="text-sm text-muted-foreground">Notificar cambios de estado</p>
              </div>
              <Switch
                checked={notifications.approvals}
                onCheckedChange={(checked) => setNotifications(prev => ({ ...prev, approvals: checked }))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Seguridad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Cambiar Contraseña</Button>
            <Button variant="outline">Configurar Autenticación 2FA</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

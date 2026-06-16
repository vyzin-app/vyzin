import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { Building2, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { mapFirebaseAuthError } from "../services/auth/FirebaseAuthService";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err) {
      setError(mapFirebaseAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-[#F1F5F9] to-[#E2E8F0] flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-[#1E293B]">Vyzin</h1>
          <p className="text-sm text-muted-foreground mt-1">Gestão Condominial</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11"
              required
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 bg-[#2563EB] hover:bg-[#1D4ED8]"
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
          <p className="text-xs text-muted-foreground text-center mb-2">Usuários de teste:</p>
          <div className="space-y-1 text-xs text-muted-foreground">
            <p><span className="font-medium">Admin:</span> admin@vyzin.com / admin123</p>
            <p><span className="font-medium">Porteiro:</span> porteiro@vyzin.com / porteiro123</p>
            <p><span className="font-medium">Morador:</span> morador@vyzin.com / morador123</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

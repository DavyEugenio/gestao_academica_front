"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/components/AuthProvider/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthTokenService from "@/app/authentication/auth.token";
import authService from "@/app/authentication/auth.service";
import { toast } from "react-toastify";
import Modal from "@/components/Modal/Modal";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export default function Login() {
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();

  const [errorMessage, setErrorMessage] = useState("");
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const isAuthenticated = AuthTokenService.isAuthenticated(false);
    if (isAuthenticated) router.push('/home');
    const emails = JSON.parse(localStorage.getItem("sgu_saved_emails") || "[]");
    setSavedEmails(emails);
    if (emails.length === 0) {
      setShowLoginForm(true);
    }
  }, []);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handleEmailSelect = (email: string) => {
    setEmail(email);
    setShowLoginForm(true);
  };

  const handleOtherLogin = () => {
    setEmail("");
    setPassword("");
    setShowLoginForm(true);
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    const updatedEmails = savedEmails.filter(email => email !== emailToRemove);
    setSavedEmails(updatedEmails);
    localStorage.setItem("sgu_saved_emails", JSON.stringify(updatedEmails));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    const dataForm = new FormData(event.currentTarget);
    const userEmail = dataForm.get('email') as string;
    const userPassword = dataForm.get('password') as string;

    const toastId = toast.loading("Processando...", {
      position: "top-right",
      closeButton: false,
      hideProgressBar: true,
      autoClose: false,
    });

    try {
      const authData = await authService.authenticate({ email: userEmail, password: userPassword });
      if (!authData || !authData.token) {
        let errorMessage = (()=>{
          if (typeof authData === "string") {
            return authData;
          }
          if (authData?.hasOwnProperty("message")) {
            return authData.message;
          }
          return "E-mail e/ou senha incorretos. Tente novamente ou redefina a sua senha.";
        })()
        throw new Error(authData?.message || errorMessage);
      }
      if (remember) {
        const updatedEmails = savedEmails.filter(email => email !== userEmail);
        updatedEmails.push(userEmail);
        localStorage.setItem("sgu_saved_emails", JSON.stringify(updatedEmails));
      }
      setIsAuthenticated(true);

      // Update the toast to success
      toast.update(toastId, {
        render: "Login realizado com sucesso!",
        type: "success",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
        hideProgressBar: false,
      });

      router.push('/home');
    } catch (error: any) {
      console.error('Erro ao fazer o login:', error);

      // Update the toast to error
      toast.update(toastId, {
        render: error?.response?.status === 401
          ? "E-mail ou senha incorretos"
          : error.message || "Erro ao fazer o login.",
        type: "error",
        isLoading: false,
        autoClose: 3000,
        closeButton: true,
        hideProgressBar: false,
      });
    }
  };

  const handleCloseModal = () => setIsModalOpen(false);

  return (
    <div className="flex flex-1 bg-white min-h-screen">
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur et
          dignissim felis. Nullam porta, libero vel volutpat hendrerit, turpis
          urna fermentum justo, ut maximus orci ligula ac risus."
      />
      {/* Seção Esquerda - Descrição */}
      <section className="hidden md:flex flex-col justify-center px-16 bg-white w-1/2">
        <h1 className="text-primary-700 text-display-small font-bold mb-4">
          Sistema de Gestão
        </h1>
        <p className="text-neutrals-600 text-body-large leading-relaxed">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur et
          dignissim felis. Nullam porta, libero vel volutpat hendrerit, turpis
          urna fermentum justo, ut maximus orci ligula ac risus.
        </p>
      </section>

      {/* Seção Direita - Formulário */}
      <section className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="bg-white shadow-xl rounded-lg px-8 py-10 w-full max-w-sm sm:max-w-md border border-neutrals-200">
          {showLoginForm ? (
            <>
              <h2 className="text-2xl font-bold text-center text-primary-500 mb-6">
                Entrar
              </h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    E-mail
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={handleEmailChange}
                    className="w-full border border-neutrals-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500 outline-none"
                    placeholder="email@ufape.edu.br"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block mb-2 text-sm font-medium text-gray-900"
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      name="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full border border-neutrals-300 rounded-md p-3 focus:ring-2 focus:ring-primary-500 outline-none pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-primary-500"
                    >
                      {mostrarSenha ? (
                        <Image
                          src="/assets/icons/eyeOff.svg"
                          alt="Facebook Icon"
                          width={24}
                          height={24}
                        />
                      ) : (
                        <Image
                          src="/assets/icons/eyeOn.svg"
                          className="text-purple-900"
                          alt="Facebook Icon"
                          width={25}
                          height={25}
                        />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="remember"
                        aria-describedby="remember"
                        type="checkbox"
                        className={`w-4 h-4 ${
                          errorMessage ? "border-red-500" : "border-gray-300"
                        } rounded bg-gray-50 focus:ring-3 focus:ring-primary-300`}
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="remember" className="text-gray-500">
                        Lembrar
                      </label>
                    </div>
                  </div>
                  <div>
                    <Link
                      href="/conta/recuperar-senha"
                      className="text-primary-500 hover:underline text-sm"
                    >
                      Esqueceu a senha?
                    </Link>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-primary-500 text-white py-3 rounded-md font-semibold hover:bg-primary-700 transition"
                >
                  Entrar
                </button>

                <div className="text-center mt-4">
                  <Link
                    href="/conta/criar-conta"
                    className="text-primary-500 font-semibold hover:underline text-sm"
                  >
                    Não possui conta? Faça o cadastro
                  </Link>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-center text-primary-500 mb-4">
                Selecione um e-mail para login
              </h2>
              {savedEmails.length > 0 ? (
                <ul className="bg-white border border-gray-300 rounded-lg mt-2">
                  {savedEmails.map((email) => (
                    <li
                      key={email}
                      className="p-2 flex justify-between items-center hover:bg-gray-200"
                    >
                      <span
                        className="cursor-pointer"
                        onClick={() => handleEmailSelect(email)}
                      >
                        {email}
                      </span>
                      <button
                        className="text-red-500 ml-2"
                        onClick={() => handleRemoveEmail(email)}
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">Nenhum e-mail salvo encontrado.</p>
              )}
              <button
                onClick={handleOtherLogin}
                className="w-full py-3 px-4 text-sm tracking-wide rounded-lg text-white bg-primary-500 hover:bg-primary-700 focus:outline-none mt-4"
              >
                Outra Conta
              </button>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
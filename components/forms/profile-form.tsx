"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Image from "next/image";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  type UpdateProfileResult,
  updateUserProfileAction,
} from "@/lib/actions/user.profile.action";

const profileSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  email: z.email("Email invalide"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ProfileFormProps = ProfileFormData & { image?: string };

export function ProfileForm({ initial }: { initial: ProfileFormProps }) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  });

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData): Promise<UpdateProfileResult> => {
      const formData = new FormData();
      Object.entries(data).forEach(([k, v]) => {
        formData.append(k, v as string);
      });
      if (file) formData.append("avatar", file);
      return updateUserProfileAction(formData);
    },
    onSuccess: (result) => {
      if (!result.success) {
        if (result.field === "email") {
          form.setError("email", { message: result.error });
        } else if (result.field === "name") {
          form.setError("name", { message: result.error });
        } else {
          toast.error(result.error);
        }
        return;
      }

      if (result.emailVerificationSent) {
        toast.success(
          "Un email de confirmation a été envoyé à votre nouvelle adresse. Veuillez cliquer sur le lien pour valider le changement.",
          { duration: 8000 },
        );
      } else {
        toast.success("Profil mis à jour");
      }
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
    },
    onError: (err) => {
      console.error("update profile error", err);
      toast.error("Une erreur est survenue. Veuillez réessayer.");
    },
  });

  const onSubmit = (data: ProfileFormData) => mutation.mutate(data);

  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<string | undefined>(
    initial.image,
  );

  React.useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <div className="flex items-center gap-8">
          <div className="relative w-20 h-20 rounded-full overflow-hidden bg-muted flex items-center justify-center">
            {preview ? (
              <Image
                src={preview}
                alt="avatar"
                fill
                unoptimized
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-sm text-muted-foreground text-center">
                Pas de photo
              </span>
            )}
          </div>

          <div className="flex-1">
            <Label>Photo de profil</Label>
            <div className="flex items-center gap-4 mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
                    setFile(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choisir une photo
              </Button>

              <div className="text-sm text-muted-foreground">
                {file ? file.name : "Aucun fichier choisi"}
              </div>
            </div>

            <div className="text-sm text-muted-foreground mt-2">
              JPG, PNG — max 2MB
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="Nom complet" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@exemple.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground">
                Un email de confirmation sera envoyé si vous modifiez votre
                adresse.
              </p>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
}

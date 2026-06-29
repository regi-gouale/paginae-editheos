"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { addAuthorAction } from "@/lib/actions/authors.refactored";

// Schema pour la validation avec zod
const addAuthorSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  biography: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  nationality: z.string().optional(),
});

type AddAuthorFormData = z.infer<typeof addAuthorSchema>;

// Pattern de résolution des actions serveur selon les instructions
async function resolveActionResult<T>(actionPromise: Promise<T>): Promise<T> {
  const result = await actionPromise;
  return result;
}

export function AddAuthorForm() {
  const queryClient = useQueryClient();

  const form = useForm<AddAuthorFormData>({
    resolver: zodResolver(addAuthorSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      biography: "",
      website: "",
      nationality: "",
    },
  });

  // Pattern useMutation avec resolveActionResult selon les instructions
  const mutation = useMutation({
    mutationFn: async (data: AddAuthorFormData) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value) formData.append(key, value);
      });
      return resolveActionResult(addAuthorAction(formData));
    },
    onSuccess: () => {
      toast.success("Auteur ajouté avec succès!");
      form.reset();
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ["authors"] });
    },
    onError: (error) => {
      console.error("Error adding author:", error);
      toast.error("Erreur lors de l'ajout de l'auteur");
    },
  });

  const onSubmit = (data: AddAuthorFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prénom</FormLabel>
                <FormControl>
                  <Input placeholder="Prénom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom</FormLabel>
                <FormControl>
                  <Input placeholder="Nom" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Site web (optionnel)</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://exemple.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nationality"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nationalité (optionnel)</FormLabel>
              <FormControl>
                <Input placeholder="Nationalité" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="biography"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Biographie (optionnel)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Biographie de l'auteur..."
                  className="min-h-25"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? "Ajout en cours..." : "Ajouter l'auteur"}
        </Button>
      </form>
    </Form>
  );
}

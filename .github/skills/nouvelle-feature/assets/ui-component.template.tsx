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

// REMPLACER : myEntityAction → votre Server Action
// import { myEntityAction } from "@/lib/actions/my-domain.action";

// -----------------------------------------------------------------
// REMPLACER : MyComponent, MyEntity, myEntityAction, "ma-clé-query"
// -----------------------------------------------------------------

const schema = z.object({
  name: z.string().min(1, "Ce champ est requis"),
  // Ajouter les autres champs ici
});

type FormData = z.infer<typeof schema>;

export function MyComponent() {
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  // Pattern mutation inline — resolveActionResult n'existe pas dans ce projet
  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      try {
        return await myEntityAction(data);
      } catch (error) {
        throw error;
      }
    },
    onSuccess: () => {
      toast.success("Élément créé avec succès");
      form.reset();
      // Invalider les queries TanStack concernées
      queryClient.invalidateQueries({ queryKey: ["ma-clé-query"] });
    },
    onError: () => {
      toast.error("Erreur lors de la création");
    },
  });

  function onSubmit(data: FormData) {
    mutation.mutate(data);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom</FormLabel>
              <FormControl>
                <Input placeholder="..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </Form>
  );
}

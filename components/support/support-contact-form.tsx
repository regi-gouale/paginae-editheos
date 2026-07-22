"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { sendSupportRequest } from "@/lib/actions/support.action";

const supportFormSchema = z.object({
  category: z.enum(["BUG", "QUESTION", "ACCOUNT", "OTHER"]),
  subject: z.string().min(1, "Le sujet est requis").max(150),
  message: z
    .string()
    .min(10, "Merci de détailler votre demande (10 caractères min.)"),
});

type SupportFormData = z.infer<typeof supportFormSchema>;

const CATEGORY_OPTIONS: {
  value: SupportFormData["category"];
  label: string;
}[] = [
  { value: "BUG", label: "🐞 Signaler un bug" },
  { value: "QUESTION", label: "❓ Question" },
  { value: "ACCOUNT", label: "👤 Compte / accès" },
  { value: "OTHER", label: "✉️ Autre" },
];

export function SupportContactForm() {
  const form = useForm<SupportFormData>({
    resolver: zodResolver(supportFormSchema),
    defaultValues: {
      category: "QUESTION",
      subject: "",
      message: "",
    },
  });

  const mutation = useMutation({
    mutationFn: sendSupportRequest,
    onSuccess: (result) => {
      if (!result.success) {
        toast.error(result.error || "Erreur lors de l'envoi de votre demande");
        return;
      }
      toast.success("Votre demande a été envoyée à l'équipe support");
      form.reset();
    },
    onError: () => {
      toast.error("Erreur lors de l'envoi de votre demande");
    },
  });

  const onSubmit = (data: SupportFormData) => {
    mutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
      >
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Catégorie</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sujet</FormLabel>
              <FormControl>
                <Input
                  placeholder="Résumez votre demande en quelques mots"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Décrivez votre problème ou votre question. Pour un bug, précisez les étapes pour le reproduire."
                  className="min-h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full sm:w-fit"
        >
          {mutation.isPending ? "Envoi en cours..." : "Envoyer ma demande"}
        </Button>
      </form>
    </Form>
  );
}

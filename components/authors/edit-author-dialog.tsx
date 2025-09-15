"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { updateAuthorAction, type Author } from "@/lib/actions/authors";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { EditIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

// Schema pour la validation avec zod
const editAuthorSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  biography: z.string().optional(),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  nationality: z.string().optional(),
  birthDate: z.string().optional(),
});

type EditAuthorFormData = z.infer<typeof editAuthorSchema>;

// Pattern de résolution des actions serveur selon les instructions
async function resolveActionResult<T>(actionPromise: Promise<T>): Promise<T> {
  try {
    const result = await actionPromise;
    return result;
  } catch (error) {
    throw error;
  }
}

type Props = {
  author: Author;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditAuthorDialog({
  author,
  open: externalOpen,
  onOpenChange,
}: Props) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Utiliser l'état externe si fourni, sinon l'état interne
  const open = externalOpen !== undefined ? externalOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  const form = useForm<EditAuthorFormData>({
    resolver: zodResolver(editAuthorSchema),
    defaultValues: {
      firstName: author.firstName,
      lastName: author.lastName,
      email: author.email,
      biography: author.biography || "",
      website: author.website || "",
      nationality: author.nationality || "",
      birthDate: author.birthDate
        ? format(new Date(author.birthDate), "yyyy-MM-dd")
        : "",
    },
  });

  const onSubmit = async (data: EditAuthorFormData) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", author.id);
        formData.append("firstName", data.firstName);
        formData.append("lastName", data.lastName);
        formData.append("email", data.email);

        if (data.biography) formData.append("biography", data.biography);
        if (data.website) formData.append("website", data.website);
        if (data.nationality) formData.append("nationality", data.nationality);
        if (data.birthDate) formData.append("birthDate", data.birthDate);

        await resolveActionResult(updateAuthorAction(formData));

        toast.success("Auteur modifié avec succès", {
          description: `${data.firstName} ${data.lastName} a été mis à jour.`,
        });
        setOpen(false);
        // Rafraîchir la page actuelle pour mettre à jour les données
        router.refresh();
      } catch (error) {
        console.error("Erreur lors de la modification:", error);
        toast.error("Erreur lors de la modification", {
          description:
            "Une erreur est survenue lors de la modification de l'auteur.",
        });
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {externalOpen === undefined && (
        <DialogTrigger asChild>
          <Button variant="outline" className="rounded-full md:rounded-xl">
            <EditIcon className="size-4" />
            <span className="hidden md:block md:ml-2">Modifier</span>
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;auteur</DialogTitle>
          <DialogDescription>
            Modifiez les informations de {author.firstName} {author.lastName}.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prénom *</FormLabel>
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
                    <FormLabel>Nom *</FormLabel>
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
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email@exemple.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nationalité</FormLabel>
                    <FormControl>
                      <Input placeholder="Nationalité" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de naissance</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site web</FormLabel>
                  <FormControl>
                    <Input placeholder="https://exemple.com" {...field} />
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
                  <FormLabel>Biographie</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Biographie de l'auteur..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Modification..." : "Modifier"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

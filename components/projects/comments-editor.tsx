"use client";

import { IconMessageCirclePlus } from "@tabler/icons-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { Textarea } from "@/components/ui/textarea";
import { createProjectComment, getProjectComments } from "@/lib/actions/kanban";

type ProjectCommentItem = {
  id: string;
  content: string;
  createdAt: Date;
  user: {
    id: string;
    name: string;
  };
};

type ProjectCommentsEditorProps = {
  projectId: string;
  canComment?: boolean;
};

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "??";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function ProjectCommentsEditor({
  projectId,
  canComment = true,
}: ProjectCommentsEditorProps) {
  const [comments, setComments] = useState<ProjectCommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadComments = async () => {
      setIsLoading(true);
      try {
        const result = await getProjectComments(projectId);
        if (mounted) {
          setComments(result as ProjectCommentItem[]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des commentaires:", error);
        toast.error("Impossible de charger les commentaires");
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    void loadComments();

    return () => {
      mounted = false;
    };
  }, [projectId]);

  const handleAddComment = async () => {
    const content = newComment.trim();

    if (!content) {
      toast.error("Le commentaire ne peut pas être vide");
      return;
    }

    setIsSubmitting(true);

    try {
      const createdComment = (await createProjectComment({
        projectId,
        content,
      })) as ProjectCommentItem;

      setComments((prev) => [createdComment, ...prev]);
      setNewComment("");
      toast.success("Commentaire ajouté");
    } catch (error) {
      console.error("Erreur lors de la création du commentaire:", error);
      toast.error("Impossible d'ajouter le commentaire");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Commentaires</Label>
      </div>

      {canComment ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={newComment}
            onChange={(event) => setNewComment(event.target.value)}
            placeholder="Ajouter un commentaire..."
            rows={3}
            className="rounded-xl"
          />
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleAddComment}
              disabled={isSubmitting}
              className="rounded-xl"
            >
              <IconMessageCirclePlus className="size-4 mr-2" />
              {isSubmitting ? "Ajout..." : "Ajouter un commentaire"}
            </Button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Vous avez un accès en lecture seule sur les commentaires.
        </p>
      )}

      <div className="h-72">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Chargement...</p>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun commentaire pour le moment.
          </p>
        ) : (
          <MessageScrollerProvider>
            <MessageScroller>
              <MessageScrollerViewport className="pr-1">
                <MessageScrollerContent className="gap-3">
                  {comments.map((comment) => (
                    <MessageScrollerItem key={comment.id}>
                      <Message>
                        <MessageAvatar className="bg-transparent self-start">
                          <Avatar className="size-7">
                            <AvatarFallback>
                              {getInitials(comment.user.name)}
                            </AvatarFallback>
                          </Avatar>
                        </MessageAvatar>
                        <MessageContent>
                          <MessageHeader className="px-0 text-sm font-medium text-foreground">
                            {comment.user.name}
                          </MessageHeader>
                          <div className="border rounded-xl px-3 py-2">
                            <p className="text-sm whitespace-pre-wrap">
                              {comment.content}
                            </p>
                          </div>
                          <MessageFooter className="px-0 text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), {
                              addSuffix: true,
                              locale: fr,
                            })}
                          </MessageFooter>
                        </MessageContent>
                      </Message>
                    </MessageScrollerItem>
                  ))}
                </MessageScrollerContent>
              </MessageScrollerViewport>
              <MessageScrollerButton direction="start" />
              <MessageScrollerButton direction="end" />
            </MessageScroller>
          </MessageScrollerProvider>
        )}
      </div>
    </div>
  );
}

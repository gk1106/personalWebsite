import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { GlassPanel } from "../components/ui/GlassPanel";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/admin/StatusBadge";
import { AdminErrorState } from "../components/admin/AdminErrorState";
import { ArticleContent } from "../components/blog/ArticleContent";
import { markdownToBlocks } from "../lib/markdownToBlocks";
import { slugify } from "../lib/slugify";
import { formatAdminDate } from "../lib/formatDate";
import { useAdminErrorHandler } from "../hooks/useAdminErrorHandler";
import { useToast } from "../hooks/useToast";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import * as adminBlogService from "../services/adminBlogService";
import { AdminApiError } from "../services/adminBlogService";
import type { AdminPostStatus, BlogPostCreateRequest } from "../types/adminBlogApi";

type SubmitKind = "draft" | "publish" | "update";

export function AdminBlogEditorPage() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== undefined;
  const postId = isEditMode ? Number(id) : null;
  const navigate = useNavigate();
  const { showToast } = useToast();
  const handleError = useAdminErrorHandler();

  const [loading, setLoading] = useState(isEditMode);
  const [loadError, setLoadError] = useState<AdminApiError | null>(null);
  const [currentStatus, setCurrentStatus] = useState<AdminPostStatus | null>(null);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [readingTime, setReadingTime] = useState("");
  const [featured, setFeatured] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<SubmitKind | null>(null);
  const [statusActionBusy, setStatusActionBusy] = useState(false);

  useDocumentMeta({ title: isEditMode ? "Edit Post — GaneshKumar (GK)" : "New Post — GaneshKumar (GK)" });

  const loadPost = useCallback(async () => {
    if (postId === null || Number.isNaN(postId)) {
      setLoadError(new AdminApiError("not-found", "This post could not be found."));
      setLoading(false);
      return;
    }

    setLoading(true);
    setLoadError(null);
    try {
      const post = await adminBlogService.getAdminPost(postId);
      setTitle(post.title);
      setSlug(post.slug);
      setSlugTouched(true);
      setExcerpt(post.excerpt ?? "");
      setCategory(post.category);
      setContentMarkdown(post.contentMarkdown ?? "");
      setReadingTime(post.readingTime != null ? String(post.readingTime) : "");
      setFeatured(post.featured);
      setCurrentStatus(post.status);
      setPublishedAt(post.publishedAt);
    } catch (err) {
      setLoadError(handleError(err));
    } finally {
      setLoading(false);
    }
  }, [postId, handleError]);

  useEffect(() => {
    if (isEditMode) loadPost();
  }, [isEditMode, loadPost]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  };

  const buildPayload = (status: AdminPostStatus): BlogPostCreateRequest => ({
    title: title.trim(),
    slug: slug.trim(),
    excerpt: excerpt.trim(),
    category: category.trim(),
    contentMarkdown,
    featured,
    readingTime: readingTime.trim() === "" ? null : Number(readingTime),
    status,
  });

  const submitCreateOrUpdate = async (status: AdminPostStatus, kind: SubmitKind) => {
    if (submitting) return;
    setFormError(null);
    setSubmitting(kind);
    try {
      const payload = buildPayload(status);
      if (isEditMode && postId !== null) {
        await adminBlogService.updatePost(postId, payload);
        showToast("success", "Post updated.");
      } else {
        await adminBlogService.createPost(payload);
        showToast("success", status === "PUBLISHED" ? "Post published." : "Draft saved.");
      }
      navigate("/admin");
    } catch (err) {
      const adminErr = handleError(err);
      if (adminErr.kind !== "unauthorized") setFormError(adminErr.message);
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (isEditMode && currentStatus) {
      submitCreateOrUpdate(currentStatus, "update");
    } else {
      submitCreateOrUpdate("DRAFT", "draft");
    }
  };

  const handleTogglePublish = async () => {
    if (postId === null || currentStatus === null || statusActionBusy) return;
    setStatusActionBusy(true);
    try {
      const updated =
        currentStatus === "DRAFT"
          ? await adminBlogService.publishPost(postId)
          : await adminBlogService.draftPost(postId);
      setCurrentStatus(updated.status);
      setPublishedAt(updated.publishedAt);
      showToast("success", updated.status === "PUBLISHED" ? "Post published." : "Post moved to draft.");
    } catch (err) {
      const adminErr = handleError(err);
      if (adminErr.kind !== "unauthorized") showToast("error", adminErr.message);
    } finally {
      setStatusActionBusy(false);
    }
  };

  if (isEditMode && loading) {
    return (
      <Container className="py-12 lg:py-16">
        <GlassPanel className="p-6 text-sm text-muted-foreground">Loading post…</GlassPanel>
      </Container>
    );
  }

  if (isEditMode && loadError) {
    return (
      <Container className="py-12 lg:py-16">
        <AdminErrorState error={loadError} onRetry={loadPost} />
      </Container>
    );
  }

  const previewBlocks = markdownToBlocks(contentMarkdown);

  return (
    <Container className="flex flex-col gap-8 py-12 lg:py-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <SectionHeading
          level="h1"
          eyebrow="Admin"
          title={isEditMode ? "Edit post" : "New post"}
          description={isEditMode ? "Update this note's content." : "Write a new note for The Lab."}
        />
        {isEditMode && currentStatus && (
          <div className="flex items-center gap-3">
            <StatusBadge status={currentStatus} />
            <Button
              type="button"
              variant="secondary"
              className="!px-4 !py-2 !text-xs"
              disabled={statusActionBusy}
              onClick={handleTogglePublish}
            >
              {statusActionBusy ? "Please wait…" : currentStatus === "DRAFT" ? "Publish" : "Move to draft"}
            </Button>
          </div>
        )}
      </div>

      {isEditMode && publishedAt && (
        <p className="text-xs text-muted-foreground">First published {formatAdminDate(publishedAt)}.</p>
      )}

      <form onSubmit={handleSubmit} noValidate className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-5">
          <Field label="Title" htmlFor="title">
            <input
              id="title"
              required
              value={title}
              onChange={(event) => handleTitleChange(event.target.value)}
              className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
            />
          </Field>

          <Field label="Slug" htmlFor="slug" hint="Auto-generated from the title — edit if you need to.">
            <input
              id="slug"
              required
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
              className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 font-mono text-sm text-foreground"
            />
          </Field>

          <Field label="Excerpt" htmlFor="excerpt">
            <textarea
              id="excerpt"
              rows={3}
              maxLength={500}
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
              className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Category" htmlFor="category">
              <input
                id="category"
                required
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
              />
            </Field>

            <Field label="Reading time (minutes)" htmlFor="readingTime">
              <input
                id="readingTime"
                type="number"
                min={1}
                value={readingTime}
                onChange={(event) => setReadingTime(event.target.value)}
                className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 text-sm text-foreground"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={featured}
              onChange={(event) => setFeatured(event.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Feature this post
          </label>

          <Field label="Content (Markdown)" htmlFor="contentMarkdown">
            <textarea
              id="contentMarkdown"
              required
              rows={16}
              value={contentMarkdown}
              onChange={(event) => setContentMarkdown(event.target.value)}
              className="w-full rounded-lg border border-border bg-background-elevated px-3 py-2 font-mono text-sm leading-relaxed text-foreground"
            />
          </Field>

          {formError && (
            <p role="alert" className="text-sm text-red-400">
              {formError}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            {isEditMode ? (
              <Button type="submit" disabled={submitting !== null}>
                {submitting === "update" ? "Saving…" : "Save changes"}
              </Button>
            ) : (
              <>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={submitting !== null}
                  onClick={() => submitCreateOrUpdate("DRAFT", "draft")}
                >
                  {submitting === "draft" ? "Saving…" : "Save as draft"}
                </Button>
                <Button
                  type="button"
                  disabled={submitting !== null}
                  onClick={() => submitCreateOrUpdate("PUBLISHED", "publish")}
                >
                  {submitting === "publish" ? "Publishing…" : "Publish"}
                </Button>
              </>
            )}
            <Button variant="ghost" type="button" onClick={() => navigate("/admin")}>
              Cancel
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Preview</h2>
          <GlassPanel className="max-h-[720px] overflow-y-auto p-6">
            {contentMarkdown.trim() === "" ? (
              <p className="text-sm text-muted-foreground">Start writing to see a preview.</p>
            ) : (
              <ArticleContent blocks={previewBlocks} />
            )}
          </GlassPanel>
        </div>
      </form>
    </Container>
  );
}

interface FieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

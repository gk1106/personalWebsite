import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Container } from "../components/ui/Container";
import { SectionHeading } from "../components/ui/SectionHeading";
import { GlassPanel } from "../components/ui/GlassPanel";
import { Button } from "../components/ui/Button";
import { StatusBadge } from "../components/admin/StatusBadge";
import { ConfirmDialog } from "../components/admin/ConfirmDialog";
import { AdminErrorState } from "../components/admin/AdminErrorState";
import { useToast } from "../hooks/useToast";
import { useAdminErrorHandler } from "../hooks/useAdminErrorHandler";
import { useLogout } from "../hooks/useLogout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import * as adminBlogService from "../services/adminBlogService";
import type { AdminApiError } from "../services/adminBlogService";
import type { AdminBlogPostApiResponse } from "../types/adminBlogApi";
import { formatAdminDate } from "../lib/formatDate";

// Backend's maximum page size — plenty for this portfolio's current scale.
// Counts below are computed from this fetched page, not a separate stats
// endpoint (none exists), so they're exact as long as post count stays <=50.
const PAGE_SIZE = 50;

export function AdminDashboardPage() {
  const [posts, setPosts] = useState<AdminBlogPostApiResponse[] | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [error, setError] = useState<AdminApiError | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminBlogPostApiResponse | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);

  const { showToast } = useToast();
  const handleError = useAdminErrorHandler();
  const handleLogout = useLogout();

  useDocumentMeta({ title: "Admin Dashboard — GaneshKumar (GK)" });

  const loadPosts = useCallback(async () => {
    setError(null);
    try {
      const page = await adminBlogService.getAdminPosts(0, PAGE_SIZE);
      setPosts(page.content);
      setTotalElements(page.totalElements);
    } catch (err) {
      setPosts(null);
      setError(handleError(err));
    }
  }, [handleError]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const publishedCount = posts?.filter((post) => post.status === "PUBLISHED").length ?? 0;
  const draftCount = posts?.filter((post) => post.status === "DRAFT").length ?? 0;

  const handlePublish = async (post: AdminBlogPostApiResponse) => {
    if (busyId !== null) return;
    setBusyId(post.id);
    try {
      await adminBlogService.publishPost(post.id);
      showToast("success", `"${post.title}" is now published.`);
      await loadPosts();
    } catch (err) {
      const adminErr = handleError(err);
      if (adminErr.kind !== "unauthorized") showToast("error", adminErr.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleDraft = async (post: AdminBlogPostApiResponse) => {
    if (busyId !== null) return;
    setBusyId(post.id);
    try {
      await adminBlogService.draftPost(post.id);
      showToast("success", `"${post.title}" moved to draft.`);
      await loadPosts();
    } catch (err) {
      const adminErr = handleError(err);
      if (adminErr.kind !== "unauthorized") showToast("error", adminErr.message);
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await adminBlogService.deletePost(deleteTarget.id);
      showToast("success", `"${deleteTarget.title}" was deleted.`);
      setDeleteTarget(null);
      await loadPosts();
    } catch (err) {
      const adminErr = handleError(err);
      if (adminErr.kind !== "unauthorized") showToast("error", adminErr.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Container className="flex flex-col gap-10 py-12 lg:py-16">
      <SectionHeading
        level="h1"
        eyebrow="Admin"
        title="Blog dashboard"
        description="Manage every note — drafts and published alike."
      />

      {error && <AdminErrorState error={error} onRetry={loadPosts} />}

      {!error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Total posts" value={posts ? totalElements : "—"} />
            <SummaryCard label="Published" value={posts ? publishedCount : "—"} />
            <SummaryCard label="Drafts" value={posts ? draftCount : "—"} />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button to="/admin/blog/new">+ New post</Button>
            <Button variant="secondary" href="#manage-posts">
              Manage posts
            </Button>
            <Button variant="ghost" type="button" onClick={handleLogout}>
              Logout
            </Button>
          </div>

          <GlassPanel id="manage-posts" className="overflow-hidden p-0">
            <div className="border-b border-border px-6 py-4">
              <h2 className="text-lg font-semibold text-foreground">Manage posts</h2>
            </div>

            {posts === null ? (
              <p className="p-6 text-sm text-muted-foreground">Loading posts…</p>
            ) : posts.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No posts yet. Create your first note.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-muted-foreground">
                    <tr>
                      <th scope="col" className="px-6 py-3 font-medium">
                        Title
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Category
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Status
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Created
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Updated
                      </th>
                      <th scope="col" className="px-4 py-3 font-medium">
                        Published
                      </th>
                      <th scope="col" className="px-6 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {posts.map((post) => (
                      <tr key={post.id}>
                        <td className="px-6 py-4 font-medium text-foreground">{post.title}</td>
                        <td className="px-4 py-4 text-muted-foreground">{post.category}</td>
                        <td className="px-4 py-4">
                          <StatusBadge status={post.status} />
                        </td>
                        <td className="px-4 py-4 text-muted-foreground">{formatAdminDate(post.createdAt)}</td>
                        <td className="px-4 py-4 text-muted-foreground">{formatAdminDate(post.updatedAt)}</td>
                        <td className="px-4 py-4 text-muted-foreground">
                          {post.publishedAt ? formatAdminDate(post.publishedAt) : "—"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Link
                              to={`/admin/blog/${post.id}/edit`}
                              className="rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground transition-colors duration-150 hover:bg-surface"
                            >
                              Edit
                            </Link>
                            {post.status === "DRAFT" ? (
                              <button
                                type="button"
                                disabled={busyId === post.id}
                                onClick={() => handlePublish(post)}
                                className="rounded-full border border-primary/40 px-3 py-1 text-xs font-medium text-primary transition-colors duration-150 hover:bg-primary/10 disabled:opacity-50"
                              >
                                {busyId === post.id ? "…" : "Publish"}
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={busyId === post.id}
                                onClick={() => handleDraft(post)}
                                className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:bg-surface disabled:opacity-50"
                              >
                                {busyId === post.id ? "…" : "Move to draft"}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(post)}
                              className="rounded-full border border-red-500/30 px-3 py-1 text-xs font-medium text-red-400 transition-colors duration-150 hover:bg-red-500/10"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </GlassPanel>
        </>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Delete this post?"
        description={
          deleteTarget ? `"${deleteTarget.title}" will be permanently deleted. This cannot be undone.` : ""
        }
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </Container>
  );
}

function SummaryCard({ label, value }: { label: string; value: ReactNode }) {
  return (
    <GlassPanel className="flex flex-col gap-1 p-5">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="text-3xl font-semibold text-foreground">{value}</span>
    </GlassPanel>
  );
}

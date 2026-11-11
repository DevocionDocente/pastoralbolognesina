import defaultMdxComponents, { createRelativeLink } from "fumadocs-ui/mdx";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/layouts/docs/page";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { manualSource } from "@/modules/manual/source";

interface ManualPageProps {
  params: Promise<{ slug?: string[] }>;
}

export default async function ManualPage({ params }: ManualPageProps) {
  const page = manualSource.getPage((await params).slug);
  if (!page) notFound();
  const Content = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <Content components={{ ...defaultMdxComponents, Step, Steps, a: createRelativeLink(manualSource, page) }} />
      </DocsBody>
    </DocsPage>
  );
}

export function generateStaticParams() {
  return manualSource.generateParams();
}

export async function generateMetadata({ params }: ManualPageProps): Promise<Metadata> {
  const page = manualSource.getPage((await params).slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}

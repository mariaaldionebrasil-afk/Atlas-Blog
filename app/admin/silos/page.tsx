import { prisma } from '@/lib/prisma';
import { SilosPanel, type SiloTreeNode } from './SilosPanel';

export default async function AdminSilosPage() {
  const pilares = await prisma.silo.findMany({
    where: { type: 'PILAR' },
    include: {
      keywords: { select: { id: true, term: true } },
      children: {
        include: {
          keywords: { select: { id: true, term: true } },
          children: {
            include: { keywords: { select: { id: true, term: true } } },
          },
        },
      },
    },
  });

  const existingPilares: SiloTreeNode[] = pilares.map(toTreeNode);

  return (
    <div className="p-8">
      <h1 className="mb-6 text-xl font-semibold text-gray-900">Estrutura de Silo</h1>
      <SilosPanel existingPilares={existingPilares} />
    </div>
  );
}

type SiloWithChildren = {
  id: string;
  name: string;
  type: string;
  keywords: { id: string; term: string }[];
  children?: SiloWithChildren[];
};

function toTreeNode(silo: SiloWithChildren): SiloTreeNode {
  return {
    id: silo.id,
    name: silo.name,
    type: silo.type as SiloTreeNode['type'],
    keywords: silo.keywords,
    children: (silo.children ?? []).map(toTreeNode),
  };
}

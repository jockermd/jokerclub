
import Navbar from "@/components/Layout/Navbar";
import ParticleBackground from "@/components/Layout/ParticleBackground";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UsersTable from "@/components/Admin/UsersTable";
import TweetsTable from "@/components/Admin/TweetsTable";
import MobileNavbar from "@/components/Layout/MobileNavbar";
import { ShieldCheck } from "lucide-react";
import ProductsTable from "@/components/Admin/ProductsTable";
import ConsultantsTable from "@/components/Admin/ConsultantsTable";
import ConsultingTable from "@/components/Admin/ConsultingTable";
import BadgesTable from "@/components/Admin/BadgesTable";
import CodeblocksTable from "@/components/Admin/CodeblocksTable";

const Admin = () => {
  return <div className="min-h-screen pb-16 md:pb-0">
      <ParticleBackground />
      <Navbar />

      <main className="container mx-auto px-4 py-6">
        <div className="glass-card rounded-xl p-3 md:p-6">
          <div className="flex items-center gap-4 mb-4 md:mb-6">
              <ShieldCheck className="h-6 w-6 md:h-8 md:w-8 text-mart-primary" />
              <h1 className="text-xl md:text-2xl font-orbitron font-bold text-white">Painel do Administrador</h1>
          </div>
          <Tabs defaultValue="users" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 md:grid-cols-7 bg-mart-dark-2">
              <TabsTrigger value="users">Gerenciar Usuários</TabsTrigger>
              <TabsTrigger value="tweets">Gerenciar Tweets</TabsTrigger>
              <TabsTrigger value="products">Gerenciar Produtos</TabsTrigger>
              <TabsTrigger value="consultants">Gerenciar Fundadores</TabsTrigger>
              <TabsTrigger value="consulting">Gerenciar Consultoria</TabsTrigger>
              <TabsTrigger value="badges">Gerenciar Badges</TabsTrigger>
              <TabsTrigger value="codeblocks">Gerenciar Codeblocks</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-4">
              <UsersTable />
            </TabsContent>
            <TabsContent value="tweets" className="mt-4">
              <TweetsTable />
            </TabsContent>
            <TabsContent value="products" className="mt-4">
              <ProductsTable />
            </TabsContent>
            <TabsContent value="consultants" className="mt-4">
              <ConsultantsTable />
            </TabsContent>
            <TabsContent value="consulting" className="mt-4">
              <ConsultingTable />
            </TabsContent>
            <TabsContent value="badges" className="mt-4">
              <BadgesTable />
            </TabsContent>
            <TabsContent value="codeblocks" className="mt-4">
              <CodeblocksTable />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <MobileNavbar />
    </div>;
};
export default Admin;

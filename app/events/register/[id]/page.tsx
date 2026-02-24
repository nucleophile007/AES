import { Suspense } from "react";
import Header from "@/components/home/Header";
import Footer from "@/components/home/Footer";
import Chatbot from "@/components/home/Chatbot";
import DynamicEventRegistrationForm from "@/components/DynamicEventRegistrationForm";
import { Loader2 } from "lucide-react";

export default async function EventRegistrationPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const eventId = parseInt(id);

  return (
    <main className="min-h-screen theme-bg-dark flex flex-col">
      <Header />
      
      <div className="flex-grow pt-20">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="h-8 w-8 animate-spin text-yellow-400" />
            </div>
          }
        >
          <DynamicEventRegistrationForm eventId={eventId} />
        </Suspense>
      </div>

      <Footer />
      <Chatbot />
    </main>
  );
}

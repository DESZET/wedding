import Navbar from "@/components/Navbar";
import StatisticsCounter from "@/components/StatisticsCounter";
import Footer from "@/components/Footer";

export default function StatisticsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <StatisticsCounter />
      <Footer />
    </div>
  );
}

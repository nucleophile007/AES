import AnimatedTestimonialsDemo from "@/components/ui/animated-testimonials-demo"

export default function Page() {
  return (
    <main id="animatedtestimonials" className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: 'hsl(var(--v0-blue-dark))' }}>
      <section className="text-center mb-16 max-w-3xl mx-auto">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-4 drop-shadow-lg" style={{ color: 'hsl(var(--v0-blue-light))' }}>
          Unlock Your Academic Potential
        </h1>
        <p className="text-lg sm:text-xl leading-relaxed" style={{ color: 'hsl(var(--v0-text-readable))' }}>
          Discover how our tailored programs and expert mentorship can transform your learning journey and help you
          achieve your dreams.
        </p>
      </section>
      <AnimatedTestimonialsDemo />
    </main>
  )
}
import { Link } from "@tanstack/react-router";


export function NotFound() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-card to-background flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8 animate-pulse">
          <div className="inline-block">
            <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary">
              404
            </h1>
          </div>
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-4">
          Página não encontrada
        </h2>

        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center px-8 py-3 rounded-lg font-semibold transition-all duration-300 bg-primary text-primary-foreground hover:shadow-lg hover:scale-105 active:scale-95"
        >
          Voltar para o início
        </Link>
      </div>
    </div>
  )
}
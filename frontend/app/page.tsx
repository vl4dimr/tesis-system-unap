import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, CheckCircle, Download, Upload } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Sistema de Tesis UNAP</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Iniciar Sesion</Button>
            </Link>
            <Link href="/register">
              <Button>Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Sistema de Gestion de Tesis
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Valida y formatea tu tesis automaticamente segun la Guia UNAP 2.0.
          Ahorra tiempo y asegura el cumplimiento de todos los requisitos de formato.
        </p>
        <Link href="/register">
          <Button size="lg" className="text-lg px-8">
            Comenzar Ahora
          </Button>
        </Link>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Como Funciona</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <CardTitle>Registra tus Datos</CardTitle>
              <CardDescription>
                Ingresa la informacion de tu tesis: titulo, jurados, palabras clave
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Carga tu Documento</CardTitle>
              <CardDescription>
                Sube tu tesis en formato Word (.docx) para su analisis
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Validacion Automatica</CardTitle>
              <CardDescription>
                El sistema verifica margenes, fuentes, interlineado y estructura
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Download className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Descarga Formateado</CardTitle>
              <CardDescription>
                Obtén tu documento con el formato correcto segun la Guia UNAP 2.0
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Requirements Preview */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Requisitos de Formato</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Tamano de Pagina</h3>
              <p className="text-gray-600">A4 (21 x 29.7 cm)</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Margenes</h3>
              <p className="text-gray-600">Superior: 3.5cm, Inferior/Izq/Der: 2.5cm</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Fuente</h3>
              <p className="text-gray-600">Times New Roman, 12pt</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Interlineado</h3>
              <p className="text-gray-600">Doble espacio (2.0)</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Sangria</h3>
              <p className="text-gray-600">Primera linea: 1.25 cm</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="font-semibold mb-2">Estructura</h3>
              <p className="text-gray-600">Capitulos I, II, III, IV</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>Sistema de Gestion de Tesis - Universidad Nacional del Altiplano</p>
        </div>
      </footer>
    </div>
  )
}

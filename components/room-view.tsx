"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AirVent, Sofa, Palette, Users, VolumeX, Coffee, AlertTriangle, Camera, Wifi, Monitor } from "lucide-react"

interface RoomViewProps {
  className?: string
}

export function RoomView({ className }: RoomViewProps) {
  const roomData = {
    name: "Sala de Reunião Premium",
    description:
      "Uma sala moderna e elegante, perfeita para reuniões profissionais, apresentações e encontros de negócios. Localizada no coração do centro empresarial, oferece um ambiente sofisticado e funcional.",
    images: [
      "/placeholder.svg?height=300&width=400&text=Sala+de+Reunião+Principal",
      "/placeholder.svg?height=300&width=400&text=Mesa+de+Conferência",
      "/placeholder.svg?height=300&width=400&text=Vista+Panorâmica",
    ],
    amenities: [
      { icon: AirVent, label: "Ar Condicionado", description: "Climatização controlada" },
      { icon: Sofa, label: "Móveis Planejados", description: "Mesa de reunião e cadeiras executivas" },
      { icon: Palette, label: "Decoração Moderna", description: "Ambiente profissional e acolhedor" },
      { icon: Wifi, label: "Wi-Fi de Alta Velocidade", description: "Internet rápida e estável" },
      { icon: Monitor, label: "TV 55'' com HDMI", description: "Para apresentações e videoconferências" },
      { icon: Camera, label: "Iluminação Natural", description: "Amplas janelas com vista panorâmica" },
    ],
    capacity: {
      max: 8,
      recommended: 6,
    },
    rules: [
      {
        title: "Capacidade",
        description: "Máximo de 8 pessoas por reunião. Recomendamos até 6 pessoas para maior conforto.",
        icon: Users,
        type: "info" as const,
      },
      {
        title: "Nível de Ruído",
        description:
          "Mantenha o volume das conversas em nível moderado. Evite ruídos excessivos que possam incomodar outras salas.",
        icon: VolumeX,
        type: "warning" as const,
      },
      {
        title: "Consumo de Alimentos e Bebidas",
        description:
          "Caso deseje consumir cafés, chás, bolos, refrigerantes ou sucos durante a reunião, será de total responsabilidade da pessoa que alugou a sala providenciar e limpar após o uso.",
        icon: Coffee,
        type: "important" as const,
      },
    ],
  }

  // Galeria real da sala (imagens locais)
  const gallery = [
    "/salas/sala-a.jpeg",
    "/salas/sala-b.jpeg",
    "/salas/sala-c.jpeg",
    "/salas/sala-d.jpeg",
  ]

  return (
    <div className={className}>
      <div className="space-y-6">
        {/* Header da Sala */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-black mb-2">{roomData.name}</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">{roomData.description}</p>
        </div>

        {/* Galeria de Fotos */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Galeria de Fotos</CardTitle>
            <CardDescription className="text-gray-600">Conheça todos os detalhes da nossa sala</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gallery.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Foto ${index + 1} da sala`}
                    className="w-full h-48 object-cover rounded-lg border border-gray-200 group-hover:shadow-lg transition-shadow"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comodidades */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Comodidades Disponíveis</CardTitle>
            <CardDescription className="text-gray-600">
              Tudo que você precisa para uma reunião produtiva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roomData.amenities.map((amenity, index) => (
                <div
                  key={index}
                  className="flex items-start space-x-3 p-4 bg-orange-50 rounded-lg border border-orange-100"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <amenity.icon className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-black">{amenity.label}</h4>
                    <p className="text-sm text-gray-600">{amenity.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Capacidade */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Informações de Capacidade</CardTitle>
            <CardDescription className="text-gray-600">
              Planeje sua reunião com o número ideal de participantes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-green-700">{roomData.capacity.recommended}</h3>
                <p className="text-green-600 font-medium">Pessoas (Recomendado)</p>
                <p className="text-sm text-gray-600 mt-2">Número ideal para máximo conforto</p>
              </div>
              <div className="text-center p-6 bg-orange-50 rounded-lg border border-orange-200">
                <Users className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                <h3 className="text-2xl font-bold text-orange-700">{roomData.capacity.max}</h3>
                <p className="text-orange-600 font-medium">Pessoas (Máximo)</p>
                <p className="text-sm text-gray-600 mt-2">Capacidade máxima permitida</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Regras e Políticas */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Regras e Políticas de Uso</CardTitle>
            <CardDescription className="text-gray-600">Diretrizes importantes para o uso da sala</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {roomData.rules.map((rule, index) => (
              <Alert
                key={index}
                className={
                  rule.type === "warning"
                    ? "border-yellow-200 bg-yellow-50"
                    : rule.type === "important"
                      ? "border-red-200 bg-red-50"
                      : "border-blue-200 bg-blue-50"
                }
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      rule.type === "warning"
                        ? "bg-yellow-100"
                        : rule.type === "important"
                          ? "bg-red-100"
                          : "bg-blue-100"
                    }`}
                  >
                    <rule.icon
                      className={`h-4 w-4 ${
                        rule.type === "warning"
                          ? "text-yellow-600"
                          : rule.type === "important"
                            ? "text-red-600"
                            : "text-blue-600"
                      }`}
                    />
                  </div>
                  <div className="flex-1">
                    <h4
                      className={`font-medium mb-1 ${
                        rule.type === "warning"
                          ? "text-yellow-800"
                          : rule.type === "important"
                            ? "text-red-800"
                            : "text-blue-800"
                      }`}
                    >
                      {rule.title}
                    </h4>
                    <AlertDescription
                      className={
                        rule.type === "warning"
                          ? "text-yellow-700"
                          : rule.type === "important"
                            ? "text-red-700"
                            : "text-blue-700"
                      }
                    >
                      {rule.description}
                    </AlertDescription>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>

        {/* Informações Adicionais */}
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="text-black">Informações Importantes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p className="font-medium mb-2">Lembre-se:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Reserve com antecedência para garantir disponibilidade</li>
                    <li>Chegue pontualmente no horário agendado</li>
                    <li>Mantenha a sala organizada durante e após o uso</li>
                    <li>Em caso de dúvidas, entre em contato com a administração</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect, useRef } from 'react'
import {
  Globe,
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Palette,
  Layout,
  ExternalLink,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { usePublicHouse } from '@/hooks/use-public'
import { useUpdateSiteConfig, useCheckSubdomain } from '@/hooks/use-site'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/components/ui/tabs'
import { PageSkeleton } from '@/components/feedback/page-skeleton'
import { ErrorState } from '@/components/feedback/error-state'

type Template = 'classic' | 'modern' | 'minimal'

const TEMPLATES: { value: Template; label: string; description: string }[] = [
  { value: 'classic', label: 'Clássico', description: 'Layout tradicional e formal' },
  { value: 'modern', label: 'Moderno', description: 'Design contemporâneo e arrojado' },
  { value: 'minimal', label: 'Minimalista', description: 'Clean e focado no conteúdo' },
]

const SITE_DOMAIN = 'sagradagestao.com.br'

export default function AdminSitePage() {
  const currentHouse = useAuthStore((s) => s.currentHouse)
  const houseId = useAuthStore((s) => s.currentHouseId())
  const slug = currentHouse?.houseSlug ?? ''

  const { data: houseData, isLoading, isError, refetch } = usePublicHouse(slug)
  const updateSiteConfig = useUpdateSiteConfig()

  // Form state
  const [siteEnabled, setSiteEnabled] = useState(false)
  const [subdomain, setSubdomain] = useState('')
  const [template, setTemplate] = useState<Template>('classic')
  const [primaryColor, setPrimaryColor] = useState('#4f46e5')
  const [secondaryColor, setSecondaryColor] = useState('#d97706')
  const [logoUrl, setLogoUrl] = useState('')
  const [heroImageUrl, setHeroImageUrl] = useState('')
  const [aboutText, setAboutText] = useState('')
  const [giraScheduleText, setGiraScheduleText] = useState('')
  const [instagramUrl, setInstagramUrl] = useState('')
  const [facebookUrl, setFacebookUrl] = useState('')
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [whatsappNumber, setWhatsappNumber] = useState('')

  // Subdomain availability check with debounce
  const [debouncedSubdomain, setDebouncedSubdomain] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const originalSubdomain = houseData?.siteConfig?.subdomain ?? ''

  const {
    data: subdomainCheck,
    isLoading: isCheckingSubdomain,
  } = useCheckSubdomain(
    debouncedSubdomain && debouncedSubdomain !== originalSubdomain
      ? debouncedSubdomain
      : ''
  )

  // Debounce subdomain input
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSubdomain(subdomain)
    }, 500)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [subdomain])

  // Initialize form from fetched data
  const [initialized, setInitialized] = useState(false)
  useEffect(() => {
    if (houseData?.siteConfig && !initialized) {
      const c = houseData.siteConfig
      setSiteEnabled(c.siteEnabled)
      setSubdomain(c.subdomain ?? '')
      setTemplate(c.template ?? 'classic')
      setPrimaryColor(c.primaryColor ?? '#4f46e5')
      setSecondaryColor(c.secondaryColor ?? '#d97706')
      setLogoUrl(c.logoUrl ?? '')
      setHeroImageUrl(c.heroImageUrl ?? '')
      setAboutText(c.aboutText ?? '')
      setGiraScheduleText(c.giraScheduleText ?? '')
      setInstagramUrl(c.instagramUrl ?? '')
      setFacebookUrl(c.facebookUrl ?? '')
      setYoutubeUrl(c.youtubeUrl ?? '')
      setWhatsappNumber(c.whatsappNumber ?? '')
      setInitialized(true)
    } else if (houseData && !houseData.siteConfig && !initialized) {
      setInitialized(true)
    }
  }, [houseData, initialized])

  const siteUrl = subdomain ? `https://${subdomain}.${SITE_DOMAIN}` : ''

  function handleSave() {
    if (!houseId) return
    updateSiteConfig.mutate({
      houseId,
      siteConfig: {
        siteEnabled,
        subdomain,
        template,
        primaryColor,
        secondaryColor,
        logoUrl,
        heroImageUrl,
        aboutText,
        giraScheduleText,
        instagramUrl,
        facebookUrl,
        youtubeUrl,
        whatsappNumber,
      },
    })
  }

  if (isLoading || !initialized) {
    return <PageSkeleton />
  }

  if (isError) {
    return (
      <div className="p-4 lg:p-6">
        <ErrorState message="Erro ao carregar configurações do site" onRetry={refetch} />
      </div>
    )
  }

  const subdomainIsOriginal = subdomain === originalSubdomain
  const showSubdomainStatus =
    subdomain.length >= 3 && !subdomainIsOriginal

  return (
    <div className="space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Globe className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Configurar Site</h1>
            <p className="text-sm text-muted-foreground">
              Personalize o site público da sua casa
            </p>
          </div>
        </div>
        {siteEnabled && subdomain && (
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex w-fit items-center gap-1.5 text-sm text-primary hover:underline"
          >
            {subdomain}.{SITE_DOMAIN}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="geral" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
        </TabsList>

        {/* Tab: Geral */}
        <TabsContent value="geral" className="space-y-6">
          {/* Site Enabled Toggle */}
          <Card>
            <CardContent className="flex items-center justify-between gap-4 pt-6">
              <div className="space-y-0.5">
                <Label className="text-base font-medium">Ativar site público</Label>
                <p className="text-sm text-muted-foreground">
                  Quando ativado, o site ficará acessível publicamente no subdomínio configurado
                </p>
              </div>
              <Switch checked={siteEnabled} onCheckedChange={setSiteEnabled} />
            </CardContent>
          </Card>

          {/* Subdomain */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Subdomínio</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9-]/g, '')
                      )
                    }
                    placeholder="minha-casa"
                    className="pr-10"
                  />
                  {showSubdomainStatus && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCheckingSubdomain ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : subdomainCheck?.available ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <X className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                <span className="shrink-0 text-sm text-muted-foreground">
                  .{SITE_DOMAIN}
                </span>
              </div>
              {showSubdomainStatus && !isCheckingSubdomain && subdomainCheck && (
                <p
                  className={`text-xs ${
                    subdomainCheck.available ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {subdomainCheck.available
                    ? 'Subdomínio disponível!'
                    : 'Subdomínio já está em uso'}
                </p>
              )}
              {subdomainIsOriginal && subdomain && (
                <p className="text-xs text-muted-foreground">
                  Subdomínio atual da sua casa
                </p>
              )}
            </CardContent>
          </Card>

          {/* Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Layout className="h-4 w-4" />
                Template
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-3">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setTemplate(t.value)}
                    className={`rounded-lg border-2 p-4 text-left transition-colors ${
                      template === t.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/30'
                    }`}
                  >
                    <p className="font-medium">{t.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t.description}
                    </p>
                    {template === t.value && (
                      <Badge variant="secondary" className="mt-2">
                        Selecionado
                      </Badge>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Colors */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4" />
                Cores
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Cor primária</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="primaryColor"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-border"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 font-mono text-sm"
                      placeholder="#4f46e5"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Cor secundária</Label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      id="secondaryColor"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer rounded border border-border"
                    />
                    <Input
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 font-mono text-sm"
                      placeholder="#d97706"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Conteúdo */}
        <TabsContent value="conteudo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Imagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">URL do Logo</Label>
                <Input
                  id="logoUrl"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://exemplo.com/logo.png"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Insira a URL de uma imagem para o logo da casa
                </p>
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="heroImageUrl">URL da Imagem de Capa</Label>
                <Input
                  id="heroImageUrl"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/hero.jpg"
                  type="url"
                />
                <p className="text-xs text-muted-foreground">
                  Imagem principal exibida no topo do site
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Textos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="aboutText">Sobre a casa</Label>
                  <span className="text-xs text-muted-foreground">
                    {aboutText.length}/2000
                  </span>
                </div>
                <Textarea
                  id="aboutText"
                  value={aboutText}
                  onChange={(e) => {
                    if (e.target.value.length <= 2000) setAboutText(e.target.value)
                  }}
                  placeholder="Conte a história e missão da sua casa..."
                  rows={6}
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="giraScheduleText">Agenda de Giras</Label>
                  <span className="text-xs text-muted-foreground">
                    {giraScheduleText.length}/1000
                  </span>
                </div>
                <Textarea
                  id="giraScheduleText"
                  value={giraScheduleText}
                  onChange={(e) => {
                    if (e.target.value.length <= 1000) setGiraScheduleText(e.target.value)
                  }}
                  placeholder="Descreva os dias e horários das giras..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Redes Sociais */}
        <TabsContent value="redes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Redes Sociais</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instagramUrl" className="flex items-center gap-2">
                  <Instagram className="h-4 w-4" />
                  Instagram
                </Label>
                <Input
                  id="instagramUrl"
                  value={instagramUrl}
                  onChange={(e) => setInstagramUrl(e.target.value)}
                  placeholder="https://instagram.com/suacasa"
                  type="url"
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="facebookUrl" className="flex items-center gap-2">
                  <Facebook className="h-4 w-4" />
                  Facebook
                </Label>
                <Input
                  id="facebookUrl"
                  value={facebookUrl}
                  onChange={(e) => setFacebookUrl(e.target.value)}
                  placeholder="https://facebook.com/suacasa"
                  type="url"
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="youtubeUrl" className="flex items-center gap-2">
                  <Youtube className="h-4 w-4" />
                  YouTube
                </Label>
                <Input
                  id="youtubeUrl"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://youtube.com/@suacasa"
                  type="url"
                />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="whatsappNumber" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsappNumber"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
                <p className="text-xs text-muted-foreground">
                  Número de telefone com DDD para contato via WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <Separator />
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          variant="outline"
          disabled={!siteEnabled || !subdomain}
          onClick={() => window.open(siteUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-4 w-4" />
          Visualizar site
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateSiteConfig.isPending}
        >
          {updateSiteConfig.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Salvar
        </Button>
      </div>
    </div>
  )
}

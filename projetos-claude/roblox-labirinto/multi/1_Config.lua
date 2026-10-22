-- ModuleScript chamado: Config
-- Configurações e funções de apoio usadas por todos os outros scripts.

local Config = {}

Config.CFG = {
	CELULA = 14,            -- tamanho de uma célula do labirinto (studs)
	ALTURA_PAREDE = 12,
	ESPESSURA = 1.2,
	CHUNK = 6,              -- células por lado em cada pedaço
	RAIO = 2,               -- pedaços carregados em volta do jogador
	RAIO_DESCARGA = 3,      -- além disso, o pedaço é apagado
	DISTANCIA_NIVEIS = 400, -- altura entre um nível e outro
	CHANCE_ESCADA = 0.22,   -- chance de um pedaço ter escada
	INTERVALO_EVENTO = { 40, 70 },
	AJUSTAR_MAPA_PADRAO = true, -- apaga a Baseplate e move o SpawnLocation
}

local CFG = Config.CFG
Config.C = CFG.CELULA
Config.N = CFG.CHUNK
-- troque por um número fixo (ex: 12345) para ter sempre o mesmo labirinto
Config.SEMENTE = Random.new():NextInteger(1, 2 ^ 30)

local Players = game:GetService("Players")

function Config.hash(...)
	local h = Config.SEMENTE
	for _, v in { ... } do
		h = (h * 31 + v * 7919 + 104729) % 2147483647
	end
	return h
end

function Config.alturaNivel(nivel)
	return (nivel - 1) * CFG.DISTANCIA_NIVEIS
end

function Config.centroCelula(nivel, gx, gz)
	local C = Config.C
	return Vector3.new(gx * C + C / 2, Config.alturaNivel(nivel) + 3, gz * C + C / 2)
end

function Config.novaParte(pai, tamanho, cf, cor, material, props)
	local p = Instance.new("Part")
	p.Anchored = true
	p.Size = tamanho
	p.CFrame = cf
	p.Color = cor
	p.Material = material or Enum.Material.SmoothPlastic
	p.TopSurface = Enum.SurfaceType.Smooth
	p.BottomSurface = Enum.SurfaceType.Smooth
	p.CastShadow = false
	if props then
		for k, v in props do
			p[k] = v
		end
	end
	p.Parent = pai
	return p
end

function Config.jogadorDoToque(hit)
	local char = hit:FindFirstAncestorOfClass("Model")
	if not char then return end
	local p = Players:GetPlayerFromCharacter(char)
	if not p then return end
	local hum = char:FindFirstChildOfClass("Humanoid")
	if not hum or hum.Health <= 0 then return end
	return p, hum, char
end

local MATERIAIS = {
	Enum.Material.Brick, Enum.Material.Slate, Enum.Material.Cobblestone,
	Enum.Material.Concrete, Enum.Material.Marble, Enum.Material.Granite,
	Enum.Material.Ice, Enum.Material.Sandstone, Enum.Material.WoodPlanks,
}

function Config.tema(nivel)
	local h = (nivel * 0.137) % 1
	return {
		parede = Color3.fromHSV(h, 0.35, 0.6),
		chao = Color3.fromHSV(h, 0.25, 0.22),
		material = MATERIAIS[(nivel - 1) % #MATERIAIS + 1],
	}
end

-- quanto maior o nível, mais perigoso
function Config.dificuldade(nivel)
	return {
		espinhos = math.min(0.04 + 0.01 * nivel, 0.14),
		dano = 10 + nivel * 2,
		portal = math.min(0.003 + 0.0008 * nivel, 0.008),
		fantasma = math.min(11 + nivel * 0.8, 17),
	}
end

return Config

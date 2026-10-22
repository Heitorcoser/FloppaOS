--[[
	LABIRINTO INFINITO
	Coloque como Script (não LocalScript) dentro de ServerScriptService.

	- O labirinto é gerado em pedaços (chunks) em volta de cada jogador, sem fim.
	- Cada pedaço é sempre igual para a mesma posição (gerado por semente),
	  então ao voltar você encontra o mesmo caminho.
	- Escadas douradas (com feixe de luz) levam ao próximo nível.
	  Cada nível tem cor nova e fica mais difícil.
	- Eventos no caminho: moedas, espinhos, baús, pads de velocidade, portais.
	- Eventos globais de tempos em tempos: apagão, fantasma, neblina,
	  chuva de moedas e vento a favor.
]]

local Players = game:GetService("Players")
local Lighting = game:GetService("Lighting")
local TweenService = game:GetService("TweenService")
local Debris = game:GetService("Debris")
local RunService = game:GetService("RunService")

---------------------------------------------------------------------
-- CONFIGURAÇÃO
---------------------------------------------------------------------
local CFG = {
	CELULA = 14,            -- tamanho de uma célula do labirinto (studs)
	ALTURA_PAREDE = 12,
	ESPESSURA = 1.2,
	CHUNK = 6,              -- células por lado em cada pedaço
	RAIO = 2,               -- pedaços carregados em volta do jogador
	RAIO_DESCARGA = 3,      -- além disso, o pedaço é apagado
	DISTANCIA_NIVEIS = 400, -- altura entre um nível e outro
	CHANCE_ESCADA = 0.22,   -- chance de um pedaço ter escada
	INTERVALO_EVENTO = {40, 70},
	AJUSTAR_MAPA_PADRAO = true, -- apaga a Baseplate e move o SpawnLocation
}

local C = CFG.CELULA
local N = CFG.CHUNK
local SEMENTE = Random.new():NextInteger(1, 2 ^ 30) -- troque por um número fixo para ter sempre o mesmo labirinto

---------------------------------------------------------------------
-- UTILITÁRIOS
---------------------------------------------------------------------
local function hash(...)
	local h = SEMENTE
	for _, v in { ... } do
		h = (h * 31 + v * 7919 + 104729) % 2147483647
	end
	return h
end

local function alturaNivel(nivel)
	return (nivel - 1) * CFG.DISTANCIA_NIVEIS
end

local function centroCelula(nivel, gx, gz)
	return Vector3.new(gx * C + C / 2, alturaNivel(nivel) + 3, gz * C + C / 2)
end

local function novaParte(pai, tamanho, cf, cor, material, props)
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

local function jogadorDoToque(hit)
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

local function tema(nivel)
	local h = (nivel * 0.137) % 1
	return {
		parede = Color3.fromHSV(h, 0.35, 0.6),
		chao = Color3.fromHSV(h, 0.25, 0.22),
		material = MATERIAIS[(nivel - 1) % #MATERIAIS + 1],
	}
end

-- quanto maior o nível, mais perigoso
local function dificuldade(nivel)
	return {
		espinhos = math.min(0.04 + 0.01 * nivel, 0.14),
		dano = 10 + nivel * 2,
		portal = math.min(0.003 + 0.0008 * nivel, 0.008),
		fantasma = math.min(11 + nivel * 0.8, 17),
	}
end

---------------------------------------------------------------------
-- ESTADO DOS JOGADORES E INTERFACE
---------------------------------------------------------------------
local estado = {} -- [player] = { checkpoint, padAte, cooldowns, ui }
local coletados = {} -- moedas e baús já pegos (não voltam ao recarregar)

local function nivelDe(p)
	local ls = p:FindFirstChild("leaderstats")
	return ls and ls.Nivel.Value or 1
end

local function criarUI(p)
	local gui = Instance.new("ScreenGui")
	gui.Name = "LabirintoUI"
	gui.ResetOnSpawn = false

	local info = Instance.new("TextLabel")
	info.Name = "Info"
	info.Size = UDim2.new(0, 190, 0, 34)
	info.Position = UDim2.new(0, 12, 0, 8)
	info.BackgroundColor3 = Color3.fromRGB(15, 15, 20)
	info.BackgroundTransparency = 0.3
	info.TextColor3 = Color3.new(1, 1, 1)
	info.Font = Enum.Font.GothamBold
	info.TextScaled = true
	info.Parent = gui
	Instance.new("UICorner", info).CornerRadius = UDim.new(0, 8)

	local banner = Instance.new("TextLabel")
	banner.Name = "Banner"
	banner.AnchorPoint = Vector2.new(0.5, 0)
	banner.Size = UDim2.new(0.8, 0, 0, 64)
	banner.Position = UDim2.new(0.5, 0, 0.14, 0)
	banner.BackgroundColor3 = Color3.fromRGB(10, 10, 15)
	banner.BackgroundTransparency = 0.25
	banner.Font = Enum.Font.GothamBlack
	banner.TextScaled = true
	banner.Visible = false
	banner.Parent = gui
	Instance.new("UICorner", banner).CornerRadius = UDim.new(0, 12)
	local limite = Instance.new("UITextSizeConstraint", banner)
	limite.MaxTextSize = 34

	gui.Parent = p:WaitForChild("PlayerGui")
	return { info = info, banner = banner, token = 0 }
end

local function atualizarInfo(p)
	local st = estado[p]
	local ls = p:FindFirstChild("leaderstats")
	if st and ls then
		st.ui.info.Text = "Nível " .. ls.Nivel.Value .. "  •  🪙 " .. ls.Moedas.Value
	end
end

local function anunciar(p, texto, cor, duracao)
	local st = estado[p]
	if not st then return end
	st.ui.token += 1
	local meu = st.ui.token
	st.ui.banner.Text = texto
	st.ui.banner.TextColor3 = cor or Color3.new(1, 1, 1)
	st.ui.banner.Visible = true
	task.delay(duracao or 3, function()
		if st.ui.token == meu then
			st.ui.banner.Visible = false
		end
	end)
end

local function anunciarTodos(texto, cor, duracao)
	for _, p in Players:GetPlayers() do
		anunciar(p, texto, cor, duracao)
	end
end

local function darMoedas(p, qtd)
	local ls = p:FindFirstChild("leaderstats")
	if ls then
		ls.Moedas.Value += qtd
	end
end

-- velocidade: normal 16, vento 26, pad 34
local ventoAte = 0
local function aplicarVelocidade(p)
	local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
	local st = estado[p]
	if not hum or not st then return end
	local agora = os.clock()
	local v = 16
	if ventoAte > agora then v = 26 end
	if st.padAte > agora then v = 34 end
	hum.WalkSpeed = v
end

local function emCooldown(p, nome, segundos)
	local st = estado[p]
	if not st then return true end
	local agora = os.clock()
	if (st.cool[nome] or 0) > agora then return true end
	st.cool[nome] = agora + segundos
	return false
end


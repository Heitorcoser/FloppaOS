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

---------------------------------------------------------------------
-- GERAÇÃO DO LABIRINTO
---------------------------------------------------------------------
local pastaLabirinto = Instance.new("Folder")
pastaLabirinto.Name = "Labirinto"
pastaLabirinto.Parent = workspace

local pastaTemp = Instance.new("Folder")
pastaTemp.Name = "LabirintoEventos"
pastaTemp.Parent = workspace

-- aberturas numa borda compartilhada entre dois pedaços (os dois lados calculam igual)
local function aberturasBorda(tipo, nivel, bx, bz)
	local r = Random.new(hash(nivel, bx, bz, tipo))
	local s = {}
	s[r:NextInteger(0, N - 1)] = true
	if r:NextNumber() < 0.5 then
		s[r:NextInteger(0, N - 1)] = true
	end
	return s
end

-- labirinto perfeito dentro do pedaço (backtracking), com alguns atalhos
local function gerarLabirinto(nivel, cx, cz)
	local rng = Random.new(hash(nivel, cx, cz, 1))
	local visitado, leste, sul = {}, {}, {}
	for i = 0, N - 1 do
		visitado[i], leste[i], sul[i] = {}, {}, {}
		for j = 0, N - 1 do
			leste[i][j] = true
			sul[i][j] = true
		end
	end
	local si, sj = rng:NextInteger(0, N - 1), rng:NextInteger(0, N - 1)
	visitado[si][sj] = true
	local pilha = { { si, sj } }
	while #pilha > 0 do
		local topo = pilha[#pilha]
		local i, j = topo[1], topo[2]
		local opcoes = {}
		if i > 0 and not visitado[i - 1][j] then table.insert(opcoes, { i - 1, j, "O" }) end
		if i < N - 1 and not visitado[i + 1][j] then table.insert(opcoes, { i + 1, j, "L" }) end
		if j > 0 and not visitado[i][j - 1] then table.insert(opcoes, { i, j - 1, "N" }) end
		if j < N - 1 and not visitado[i][j + 1] then table.insert(opcoes, { i, j + 1, "S" }) end
		if #opcoes == 0 then
			table.remove(pilha)
		else
			local o = opcoes[rng:NextInteger(1, #opcoes)]
			if o[3] == "O" then leste[i - 1][j] = false
			elseif o[3] == "L" then leste[i][j] = false
			elseif o[3] == "N" then sul[i][j - 1] = false
			else sul[i][j] = false end
			visitado[o[1]][o[2]] = true
			table.insert(pilha, { o[1], o[2] })
		end
	end
	for _ = 1, 3 do -- atalhos: deixa o labirinto menos linear
		local i, j = rng:NextInteger(0, N - 2), rng:NextInteger(0, N - 2)
		if rng:NextNumber() < 0.5 then leste[i][j] = false else sul[i][j] = false end
	end
	return {
		rng = rng,
		leste = leste,
		sul = sul,
		norte = aberturasBorda(2, nivel, cx, cz),          -- borda de cima deste pedaço
		oeste = aberturasBorda(3, nivel, cx, cz),          -- borda da esquerda deste pedaço
		bordaSul = aberturasBorda(2, nivel, cx, cz + 1),   -- borda de cima do vizinho de baixo
		bordaLeste = aberturasBorda(3, nivel, cx + 1, cz), -- borda da esquerda do vizinho da direita
	}
end

local function saidas(m, i, j)
	local r = {}
	if (i > 0 and not m.leste[i - 1][j]) or (i == 0 and m.oeste[j]) then table.insert(r, Vector3.new(-1, 0, 0)) end
	if (i < N - 1 and not m.leste[i][j]) or (i == N - 1 and m.bordaLeste[j]) then table.insert(r, Vector3.new(1, 0, 0)) end
	if (j > 0 and not m.sul[i][j - 1]) or (j == 0 and m.norte[i]) then table.insert(r, Vector3.new(0, 0, -1)) end
	if (j < N - 1 and not m.sul[i][j]) or (j == N - 1 and m.bordaSul[i]) then table.insert(r, Vector3.new(0, 0, 1)) end
	return r
end

---------------------------------------------------------------------
-- EVENTOS NO CAMINHO
---------------------------------------------------------------------
local moedas = {}   -- para girar
local espinhos = {} -- grupos de espinhos ativos
local espinhosErguidos = false
local subirNivel, teleportar -- definidos mais abaixo

local function criarMoeda(pai, pos, chave)
	local m = novaParte(pai, Vector3.new(0.4, 2.4, 2.4), CFrame.new(pos), Color3.fromRGB(255, 200, 40), Enum.Material.Neon, {
		Shape = Enum.PartType.Cylinder, CanCollide = false, Name = "Moeda",
	})
	table.insert(moedas, m)
	m.Touched:Connect(function(hit)
		local p = jogadorDoToque(hit)
		if not p or not m.Parent then return end
		if chave then coletados[chave] = true end
		m:Destroy()
		darMoedas(p, 1)
	end)
	return m
end

local function criarEspinhos(pai, centro, y0, nivel)
	local grupo = Instance.new("Model")
	grupo.Name = "Espinhos"
	grupo:SetAttribute("Y0", y0)
	grupo:SetAttribute("Dano", dificuldade(nivel).dano)
	grupo:SetAttribute("Centro", centro)
	novaParte(grupo, Vector3.new(C - 4, 0.2, C - 4), CFrame.new(centro.X, y0 + 0.05, centro.Z), Color3.fromRGB(70, 20, 20), Enum.Material.DiamondPlate)
	for a = -1, 1 do
		for b = -1, 1 do
			novaParte(grupo, Vector3.new(0.7, 2.2, 0.7), CFrame.new(centro.X + a * 3, y0 - 1.2, centro.Z + b * 3), Color3.fromRGB(210, 40, 40), Enum.Material.Metal, {
				Name = "Ponta",
			})
		end
	end
	grupo.Parent = pai
	table.insert(espinhos, grupo)
end

local function criarBau(pai, centro, y0, nivel, chave)
	local bau = Instance.new("Model")
	bau.Name = "Bau"
	local corpo = novaParte(bau, Vector3.new(4, 2.5, 3), CFrame.new(centro.X, y0 + 1.25, centro.Z), Color3.fromRGB(120, 72, 30), Enum.Material.Wood)
	novaParte(bau, Vector3.new(4.2, 0.6, 3.2), CFrame.new(centro.X, y0 + 2.8, centro.Z), Color3.fromRGB(240, 190, 50), Enum.Material.Metal)
	bau.Parent = pai
	corpo.Touched:Connect(function(hit)
		local p = jogadorDoToque(hit)
		if not p or not bau.Parent then return end
		coletados[chave] = true
		bau:Destroy()
		local premio = 10 + nivel * 3
		darMoedas(p, premio)
		anunciar(p, "BAÚ! +" .. premio .. " moedas", Color3.fromRGB(255, 210, 60), 2)
	end)
end

local function criarPadVelocidade(pai, centro, y0)
	local pad = novaParte(pai, Vector3.new(C - 6, 0.2, C - 6), CFrame.new(centro.X, y0 + 0.1, centro.Z), Color3.fromRGB(40, 230, 255), Enum.Material.Neon, {
		Name = "PadVelocidade",
	})
	pad.Touched:Connect(function(hit)
		local p = jogadorDoToque(hit)
		if not p or emCooldown(p, "pad", 2) then return end
		estado[p].padAte = os.clock() + 5
		aplicarVelocidade(p)
		task.delay(5.1, aplicarVelocidade, p)
		anunciar(p, "VELOCIDADE!", Color3.fromRGB(40, 230, 255), 1.2)
	end)
end

local function criarPortal(pai, centro, nivel)
	local portal = novaParte(pai, Vector3.new(6, 6, 6), CFrame.new(centro + Vector3.new(0, 0.5, 0)), Color3.fromRGB(170, 60, 255), Enum.Material.Neon, {
		Shape = Enum.PartType.Ball, Transparency = 0.3, CanCollide = false, Name = "Portal",
	})
	local luz = Instance.new("PointLight", portal)
	luz.Color = portal.Color
	luz.Range = 16
	portal.Touched:Connect(function(hit)
		local p = jogadorDoToque(hit)
		if not p or emCooldown(p, "portal", 3) then return end
		local gx, gz = math.floor(centro.X / C), math.floor(centro.Z / C)
		local function salto()
			local d = math.random(12, 20)
			return math.random() < 0.5 and -d or d
		end
		teleportar(p, nivel, gx + salto(), gz + salto())
		anunciar(p, "PORTAL! Você foi jogado para longe", Color3.fromRGB(200, 120, 255), 2.5)
	end)
end

local function criarEscada(pai, centro, y0, nivel, direcao)
	local cor = Color3.fromRGB(240, 200, 60)
	local alongX = direcao.X ~= 0
	local function tamanho(profundidade, altura)
		return alongX and Vector3.new(profundidade, altura, 6) or Vector3.new(6, altura, profundidade)
	end
	local chao = Vector3.new(centro.X, y0, centro.Z)
	for i = 1, 7 do -- degraus começam na entrada da célula e sobem até o fundo
		local h = 1.5 * i
		local s = 5.25 - (i - 1) * 1.5
		novaParte(pai, tamanho(1.5, h), CFrame.new(chao + direcao * s + Vector3.new(0, h / 2, 0)), cor, Enum.Material.Marble, { Name = "Degrau" })
	end
	local topo = novaParte(pai, tamanho(1.9, 12), CFrame.new(chao + direcao * -5.45 + Vector3.new(0, 6, 0)), cor, Enum.Material.Marble, { Name = "Topo" })
	novaParte(pai, tamanho(1.9, 0.2), CFrame.new(chao + direcao * -5.45 + Vector3.new(0, 12.1, 0)), Color3.fromRGB(255, 240, 120), Enum.Material.Neon)

	-- feixe de luz para achar a escada de longe
	novaParte(pai, Vector3.new(1.5, 70, 1.5), CFrame.new(centro.X, y0 + 47, centro.Z), Color3.fromRGB(255, 220, 80), Enum.Material.Neon, {
		Transparency = 0.55, CanCollide = false, CanTouch = false, CanQuery = false, Name = "Feixe",
	})

	local placa = Instance.new("BillboardGui")
	placa.Size = UDim2.new(0, 160, 0, 40)
	placa.StudsOffset = Vector3.new(0, 5, 0)
	placa.AlwaysOnTop = false
	placa.Parent = topo
	local txt = Instance.new("TextLabel")
	txt.Size = UDim2.fromScale(1, 1)
	txt.BackgroundTransparency = 1
	txt.Text = "▲ NÍVEL " .. (nivel + 1)
	txt.TextColor3 = Color3.fromRGB(255, 230, 90)
	txt.TextStrokeTransparency = 0.3
	txt.Font = Enum.Font.GothamBlack
	txt.TextScaled = true
	txt.Parent = placa

	local gatilho = novaParte(pai, tamanho(3.6, 6), CFrame.new(chao + direcao * -4.8 + Vector3.new(0, 15, 0)), cor, Enum.Material.SmoothPlastic, {
		Transparency = 1, CanCollide = false, Name = "Subir",
	})
	local gx, gz = math.floor(centro.X / C), math.floor(centro.Z / C)
	gatilho.Touched:Connect(function(hit)
		local p = jogadorDoToque(hit)
		if not p or nivelDe(p) ~= nivel or emCooldown(p, "subir", 2) then return end
		subirNivel(p, gx, gz)
	end)
end

---------------------------------------------------------------------
-- MONTAGEM DE UM PEDAÇO
---------------------------------------------------------------------
local function construirPedaco(nivel, cx, cz)
	local m = gerarLabirinto(nivel, cx, cz)
	local t = tema(nivel)
	local dif = dificuldade(nivel)
	local y0 = alturaNivel(nivel)
	local ox, oz = cx * N * C, cz * N * C

	local modelo = Instance.new("Model")
	modelo.Name = nivel .. ":" .. cx .. ":" .. cz

	novaParte(modelo, Vector3.new(N * C, 1, N * C), CFrame.new(ox + N * C / 2, y0 - 0.5, oz + N * C / 2), t.chao, Enum.Material.Slate, { Name = "Chao" })

	local function parede(x1, z1, x2, z2)
		local comp = math.max(math.abs(x2 - x1), math.abs(z2 - z1)) + CFG.ESPESSURA
		local tam = (x1 == x2) and Vector3.new(CFG.ESPESSURA, CFG.ALTURA_PAREDE, comp) or Vector3.new(comp, CFG.ALTURA_PAREDE, CFG.ESPESSURA)
		novaParte(modelo, tam, CFrame.new((x1 + x2) / 2, y0 + CFG.ALTURA_PAREDE / 2, (z1 + z2) / 2), t.parede, t.material, { Name = "Parede" })
	end

	for i = 0, N - 1 do
		for j = 0, N - 1 do
			local x, z = ox + i * C, oz + j * C
			if i < N - 1 and m.leste[i][j] then parede(x + C, z, x + C, z + C) end
			if j < N - 1 and m.sul[i][j] then parede(x, z + C, x + C, z + C) end
			if j == 0 and not m.norte[i] then parede(x, z, x + C, z) end
			if i == 0 and not m.oeste[j] then parede(x, z, x, z + C) end
		end
	end

	-- escada: num beco sem saída do miolo do pedaço
	local escadaI, escadaJ
	local sorteioEscada = m.rng:NextNumber()
	local pedacoInicial = (nivel == 1 and cx == 0 and cz == 0)
	if sorteioEscada < CFG.CHANCE_ESCADA and not pedacoInicial then
		local becos = {}
		for i = 1, N - 2 do
			for j = 1, N - 2 do
				local s = saidas(m, i, j)
				if #s == 1 then table.insert(becos, { i, j, s[1] }) end
			end
		end
		if #becos > 0 then
			local b = becos[m.rng:NextInteger(1, #becos)]
			escadaI, escadaJ = b[1], b[2]
			local gx, gz = cx * N + b[1], cz * N + b[2]
			criarEscada(modelo, centroCelula(nivel, gx, gz), y0, nivel, b[3])
		end
	end

	-- conteúdo das células
	for i = 0, N - 1 do
		for j = 0, N - 1 do
			local r = m.rng:NextNumber()
			local ehEscada = (i == escadaI and j == escadaJ)
			local ehInicio = (cx == 0 and cz == 0 and i == 0 and j == 0)
			if ehEscada or ehInicio then continue end
			local gx, gz = cx * N + i, cz * N + j
			local chave = nivel .. ":" .. gx .. ":" .. gz
			local centro = centroCelula(nivel, gx, gz)
			local limite = dif.espinhos
			if r < limite then
				criarEspinhos(modelo, centro, y0, nivel)
				continue
			end
			limite += 0.10
			if r < limite then
				if not coletados["m" .. chave] then criarMoeda(modelo, centro, "m" .. chave) end
				continue
			end
			limite += 0.012
			if r < limite then
				if not coletados["b" .. chave] then criarBau(modelo, centro, y0, nivel, "b" .. chave) end
				continue
			end
			limite += 0.012
			if r < limite then
				criarPadVelocidade(modelo, centro, y0)
				continue
			end
			limite += dif.portal
			if r < limite then
				criarPortal(modelo, centro, nivel)
			end
		end
	end

	modelo.Parent = pastaLabirinto
	return modelo
end

---------------------------------------------------------------------
-- CARREGAR / DESCARREGAR PEDAÇOS
---------------------------------------------------------------------
local carregados = {} -- chave -> modelo

local function chavePedaco(nivel, cx, cz)
	return nivel .. ":" .. cx .. ":" .. cz
end

local function garantirPedaco(nivel, cx, cz)
	local k = chavePedaco(nivel, cx, cz)
	if not carregados[k] then
		carregados[k] = construirPedaco(nivel, cx, cz)
	end
	return carregados[k]
end

local function pedacoDe(pos)
	return math.floor(pos.X / (N * C)), math.floor(pos.Z / (N * C))
end

teleportar = function(p, nivel, gx, gz)
	local char = p.Character
	if not char then return end
	garantirPedaco(nivel, math.floor(gx / N), math.floor(gz / N))
	local hrp = char:FindFirstChild("HumanoidRootPart")
	if hrp then hrp.AssemblyLinearVelocity = Vector3.zero end
	char:PivotTo(CFrame.new(centroCelula(nivel, gx, gz)))
end

subirNivel = function(p, gx, gz)
	local ls = p:FindFirstChild("leaderstats")
	local st = estado[p]
	if not ls or not st then return end
	local novo = ls.Nivel.Value + 1
	ls.Nivel.Value = novo
	st.checkpoint = { nivel = novo, gx = gx, gz = gz }
	teleportar(p, novo, gx, gz)
	darMoedas(p, 5 * novo)
	local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
	if hum then hum.Health = hum.MaxHealth end
	anunciar(p, "NÍVEL " .. novo .. "!  +" .. (5 * novo) .. " moedas", Color3.fromRGB(255, 220, 70), 3)
end

task.spawn(function()
	while true do
		local queridos = {}
		for _, p in Players:GetPlayers() do
			local st = estado[p]
			local hrp = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
			if st and hrp then
				local nivel = nivelDe(p)
				-- caiu para fora do labirinto: volta ao checkpoint
				if hrp.Position.Y < alturaNivel(nivel) - 40 then
					teleportar(p, st.checkpoint.nivel, st.checkpoint.gx, st.checkpoint.gz)
				end
				local pcx, pcz = pedacoDe(hrp.Position)
				local construidos = 0
				for dx = -CFG.RAIO_DESCARGA, CFG.RAIO_DESCARGA do
					for dz = -CFG.RAIO_DESCARGA, CFG.RAIO_DESCARGA do
						local k = chavePedaco(nivel, pcx + dx, pcz + dz)
						queridos[k] = true
						if math.abs(dx) <= CFG.RAIO and math.abs(dz) <= CFG.RAIO and not carregados[k] then
							garantirPedaco(nivel, pcx + dx, pcz + dz)
							construidos += 1
							if construidos % 2 == 0 then task.wait() end
						end
					end
				end
			end
		end
		for k, modelo in carregados do
			if not queridos[k] then
				modelo:Destroy()
				carregados[k] = nil
			end
		end
		task.wait(0.4)
	end
end)

---------------------------------------------------------------------
-- LAÇOS DOS EVENTOS NO CAMINHO
---------------------------------------------------------------------
-- espinhos sobem e descem
task.spawn(function()
	while true do
		task.wait(1.4)
		espinhosErguidos = not espinhosErguidos
		for i = #espinhos, 1, -1 do
			local g = espinhos[i]
			if not g.Parent then
				table.remove(espinhos, i)
			else
				local y0 = g:GetAttribute("Y0")
				local alvo = espinhosErguidos and (y0 + 1.1) or (y0 - 1.2)
				for _, ponta in g:GetChildren() do
					if ponta.Name == "Ponta" then
						ponta.Position = Vector3.new(ponta.Position.X, alvo, ponta.Position.Z)
					end
				end
			end
		end
	end
end)

-- dano dos espinhos erguidos
task.spawn(function()
	while true do
		task.wait(0.2)
		if espinhosErguidos then
			for _, p in Players:GetPlayers() do
				local char = p.Character
				local hrp = char and char:FindFirstChild("HumanoidRootPart")
				local hum = char and char:FindFirstChildOfClass("Humanoid")
				if hrp and hum and hum.Health > 0 then
					for _, g in espinhos do
						if g.Parent then
							local c = g:GetAttribute("Centro")
							local d = hrp.Position - c
							if math.abs(d.X) < C / 2 - 2 and math.abs(d.Z) < C / 2 - 2 and math.abs(d.Y) < 4 then
								if not emCooldown(p, "espinho", 0.8) then
									hum:TakeDamage(g:GetAttribute("Dano"))
								end
								break
							end
						end
					end
				end
			end
		end
	end
end)

-- moedas girando
task.spawn(function()
	while true do
		task.wait(0.05)
		for i = #moedas, 1, -1 do
			local m = moedas[i]
			if not m.Parent then
				table.remove(moedas, i)
			else
				m.CFrame *= CFrame.Angles(0, 0.12, 0)
			end
		end
	end
end)

---------------------------------------------------------------------
-- EVENTOS GLOBAIS
---------------------------------------------------------------------
local atm = Lighting:FindFirstChildOfClass("Atmosphere") or Instance.new("Atmosphere", Lighting)
local base = {
	ClockTime = 17.6,
	Brightness = 2,
	Ambient = Color3.fromRGB(90, 90, 105),
	OutdoorAmbient = Color3.fromRGB(110, 110, 125),
	Densidade = 0.38,
}
Lighting.ClockTime = base.ClockTime
Lighting.Brightness = base.Brightness
Lighting.Ambient = base.Ambient
Lighting.OutdoorAmbient = base.OutdoorAmbient
atm.Density = base.Densidade
atm.Offset = 0.1
atm.Color = Color3.fromRGB(150, 150, 170)
atm.Decay = Color3.fromRGB(60, 60, 80)

local function lanternas(ligar)
	for _, p in Players:GetPlayers() do
		local hrp = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
		if hrp then
			local l = hrp:FindFirstChild("Lanterna")
			if ligar and not l then
				l = Instance.new("PointLight")
				l.Name = "Lanterna"
				l.Range = 18
				l.Brightness = 1.6
				l.Color = Color3.fromRGB(255, 230, 190)
				l.Parent = hrp
			elseif not ligar and l then
				l:Destroy()
			end
		end
	end
end

local function soltarFantasma(p)
	local hrp = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
	if not hrp then return end
	local dif = dificuldade(nivelDe(p))
	local ang = math.random() * math.pi * 2
	local inicio = hrp.Position + Vector3.new(math.cos(ang) * 45, 2, math.sin(ang) * 45)
	local f = novaParte(pastaTemp, Vector3.new(5, 5, 5), CFrame.new(inicio), Color3.fromRGB(230, 240, 255), Enum.Material.Neon, {
		Shape = Enum.PartType.Ball, Transparency = 0.35, CanCollide = false, CanTouch = false, CanQuery = false, Name = "Fantasma",
	})
	local luz = Instance.new("PointLight", f)
	luz.Range = 14
	local fim = os.clock() + 25
	local conexao
	conexao = RunService.Heartbeat:Connect(function(dt)
		local char = p.Character
		local alvo = char and char:FindFirstChild("HumanoidRootPart")
		if os.clock() > fim or not alvo or not p.Parent or not f.Parent then
			conexao:Disconnect()
			f:Destroy()
			return
		end
		local delta = alvo.Position - f.Position
		local dist = delta.Magnitude
		if dist > 0.5 then
			f.CFrame = CFrame.new(f.Position + delta.Unit * math.min(dist, dif.fantasma * dt))
		end
		if dist < 4.5 and not emCooldown(p, "fantasma", 1) then
			local hum = char:FindFirstChildOfClass("Humanoid")
			if hum then hum:TakeDamage(dif.dano * 2) end
		end
	end)
end

local EVENTOS = {
	{
		nome = "APAGÃO! Só sua lanterna ilumina",
		cor = Color3.fromRGB(180, 180, 255),
		rodar = function()
			local info = TweenInfo.new(1.5)
			TweenService:Create(Lighting, info, { ClockTime = 0, Brightness = 0.1, Ambient = Color3.new(0, 0, 0), OutdoorAmbient = Color3.fromRGB(10, 10, 15) }):Play()
			lanternas(true)
			task.wait(20)
			TweenService:Create(Lighting, info, { ClockTime = base.ClockTime, Brightness = base.Brightness, Ambient = base.Ambient, OutdoorAmbient = base.OutdoorAmbient }):Play()
			lanternas(false)
		end,
	},
	{
		nome = "UM FANTASMA ESTÁ TE CAÇANDO! Corra!",
		cor = Color3.fromRGB(230, 240, 255),
		rodar = function()
			for _, p in Players:GetPlayers() do
				soltarFantasma(p)
			end
		end,
	},
	{
		nome = "NEBLINA! Não dá pra ver nada",
		cor = Color3.fromRGB(200, 200, 210),
		rodar = function()
			TweenService:Create(atm, TweenInfo.new(2), { Density = 0.8 }):Play()
			task.wait(25)
			TweenService:Create(atm, TweenInfo.new(2), { Density = base.Densidade }):Play()
		end,
	},
	{
		nome = "CHUVA DE MOEDAS!",
		cor = Color3.fromRGB(255, 210, 60),
		rodar = function()
			for _, p in Players:GetPlayers() do
				local hrp = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
				if hrp then
					local nivel = nivelDe(p)
					local gx, gz = math.floor(hrp.Position.X / C), math.floor(hrp.Position.Z / C)
					for _ = 1, 10 do
						local pos = centroCelula(nivel, gx + math.random(-3, 3), gz + math.random(-3, 3)) + Vector3.new(math.random(-3, 3), 0, math.random(-3, 3))
						local m = criarMoeda(pastaTemp, pos, nil)
						Debris:AddItem(m, 30)
					end
				end
			end
		end,
	},
	{
		nome = "VENTO A FAVOR! Mais velocidade",
		cor = Color3.fromRGB(120, 255, 180),
		rodar = function()
			ventoAte = os.clock() + 20
			for _, p in Players:GetPlayers() do aplicarVelocidade(p) end
			task.wait(20.1)
			for _, p in Players:GetPlayers() do aplicarVelocidade(p) end
		end,
	},
}

task.spawn(function()
	task.wait(30)
	while true do
		local ev = EVENTOS[math.random(1, #EVENTOS)]
		anunciarTodos(ev.nome, ev.cor, 3.5)
		task.spawn(ev.rodar)
		task.wait(math.random(CFG.INTERVALO_EVENTO[1], CFG.INTERVALO_EVENTO[2]))
	end
end)

---------------------------------------------------------------------
-- JOGADORES
---------------------------------------------------------------------
local function aoEntrar(p)
	local ls = Instance.new("Folder")
	ls.Name = "leaderstats"
	local nivel = Instance.new("IntValue")
	nivel.Name = "Nivel"
	nivel.Value = 1
	nivel.Parent = ls
	local moedasV = Instance.new("IntValue")
	moedasV.Name = "Moedas"
	moedasV.Parent = ls
	ls.Parent = p

	estado[p] = {
		checkpoint = { nivel = 1, gx = 0, gz = 0 },
		padAte = 0,
		cool = {},
		ui = criarUI(p),
	}
	nivel.Changed:Connect(function() atualizarInfo(p) end)
	moedasV.Changed:Connect(function() atualizarInfo(p) end)
	atualizarInfo(p)

	local function aoNascer(char)
		char:WaitForChild("HumanoidRootPart", 10)
		task.wait()
		local cp = estado[p] and estado[p].checkpoint
		if cp then teleportar(p, cp.nivel, cp.gx, cp.gz) end
		aplicarVelocidade(p)
		if Lighting.ClockTime < 5 then lanternas(true) end
	end
	p.CharacterAdded:Connect(aoNascer)
	if p.Character then task.spawn(aoNascer, p.Character) end

	task.delay(2, function()
		anunciar(p, "Ache a escada dourada para subir de nível!", Color3.fromRGB(255, 220, 70), 4)
	end)
end

Players.PlayerAdded:Connect(aoEntrar)
for _, p in Players:GetPlayers() do task.spawn(aoEntrar, p) end
Players.PlayerRemoving:Connect(function(p) estado[p] = nil end)

---------------------------------------------------------------------
-- MAPA PADRÃO
---------------------------------------------------------------------
if CFG.AJUSTAR_MAPA_PADRAO then
	local bp = workspace:FindFirstChild("Baseplate")
	if bp then bp:Destroy() end
	local spawnLoc = workspace:FindFirstChildOfClass("SpawnLocation")
	if spawnLoc then
		spawnLoc.Size = Vector3.new(6, 1, 6)
		spawnLoc.CFrame = CFrame.new(C / 2, 0.5, C / 2)
	end
end
garantirPedaco(1, 0, 0)

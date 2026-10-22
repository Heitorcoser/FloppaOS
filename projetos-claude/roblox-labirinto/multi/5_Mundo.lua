-- ModuleScript chamado: Mundo
-- Monta cada pedaço do labirinto e cuida de teleporte e subida de nível.

local Config = require(script.Parent.Config)
local Estado = require(script.Parent.Estado)
local Gerador = require(script.Parent.Gerador)
local Eventos = require(script.Parent.Eventos)

local CFG, C, N = Config.CFG, Config.C, Config.N
local novaParte, centroCelula, alturaNivel = Config.novaParte, Config.centroCelula, Config.alturaNivel

local Mundo = {
	carregados = {}, -- chave -> modelo do pedaço
}

function Mundo.chavePedaco(nivel, cx, cz)
	return nivel .. ":" .. cx .. ":" .. cz
end

function Mundo.pedacoDe(pos)
	return math.floor(pos.X / (N * C)), math.floor(pos.Z / (N * C))
end

function Mundo.construirPedaco(nivel, cx, cz)
	local m = Gerador.gerarLabirinto(nivel, cx, cz)
	local t = Config.tema(nivel)
	local dif = Config.dificuldade(nivel)
	local y0 = alturaNivel(nivel)
	local ox, oz = cx * N * C, cz * N * C

	local modelo = Instance.new("Model")
	modelo.Name = Mundo.chavePedaco(nivel, cx, cz)

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
				local s = Gerador.saidas(m, i, j)
				if #s == 1 then table.insert(becos, { i, j, s[1] }) end
			end
		end
		if #becos > 0 then
			local b = becos[m.rng:NextInteger(1, #becos)]
			escadaI, escadaJ = b[1], b[2]
			local gx, gz = cx * N + b[1], cz * N + b[2]
			Eventos.criarEscada(modelo, centroCelula(nivel, gx, gz), y0, nivel, b[3])
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
				Eventos.criarEspinhos(modelo, centro, y0, nivel)
				continue
			end
			limite += 0.10
			if r < limite then
				if not Estado.coletados["m" .. chave] then Eventos.criarMoeda(modelo, centro, "m" .. chave) end
				continue
			end
			limite += 0.012
			if r < limite then
				if not Estado.coletados["b" .. chave] then Eventos.criarBau(modelo, centro, y0, nivel, "b" .. chave) end
				continue
			end
			limite += 0.012
			if r < limite then
				Eventos.criarPadVelocidade(modelo, centro, y0)
				continue
			end
			limite += dif.portal
			if r < limite then
				Eventos.criarPortal(modelo, centro, nivel)
			end
		end
	end

	modelo.Parent = Estado.pastaLabirinto
	return modelo
end

function Mundo.garantirPedaco(nivel, cx, cz)
	local k = Mundo.chavePedaco(nivel, cx, cz)
	if not Mundo.carregados[k] then
		Mundo.carregados[k] = Mundo.construirPedaco(nivel, cx, cz)
	end
	return Mundo.carregados[k]
end

function Mundo.teleportar(p, nivel, gx, gz)
	local char = p.Character
	if not char then return end
	Mundo.garantirPedaco(nivel, math.floor(gx / N), math.floor(gz / N))
	local hrp = char:FindFirstChild("HumanoidRootPart")
	if hrp then hrp.AssemblyLinearVelocity = Vector3.zero end
	char:PivotTo(CFrame.new(centroCelula(nivel, gx, gz)))
end

function Mundo.subirNivel(p, gx, gz)
	local ls = p:FindFirstChild("leaderstats")
	local st = Estado.jogadores[p]
	if not ls or not st then return end
	local novo = ls.Nivel.Value + 1
	ls.Nivel.Value = novo
	st.checkpoint = { nivel = novo, gx = gx, gz = gz }
	Mundo.teleportar(p, novo, gx, gz)
	Estado.darMoedas(p, 5 * novo)
	local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
	if hum then hum.Health = hum.MaxHealth end
	Estado.anunciar(p, "NÍVEL " .. novo .. "!  +" .. (5 * novo) .. " moedas", Color3.fromRGB(255, 220, 70), 3)
end

-- liga os eventos (escadas e portais) às funções acima
Estado.hooks.teleportar = Mundo.teleportar
Estado.hooks.subirNivel = Mundo.subirNivel

return Mundo

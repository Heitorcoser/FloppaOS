-- ModuleScript chamado: Eventos
-- Objetos que ficam espalhados no labirinto: moedas, espinhos, baús, pads, portais e escadas.

local Config = require(script.Parent.Config)
local Estado = require(script.Parent.Estado)

local C = Config.C
local novaParte, jogadorDoToque = Config.novaParte, Config.jogadorDoToque
local emCooldown, darMoedas, anunciar = Estado.emCooldown, Estado.darMoedas, Estado.anunciar

local Eventos = {
	moedas = {},            -- moedas ativas (o Principal faz elas girarem)
	espinhos = {},          -- grupos de espinhos ativos
	espinhosErguidos = false,
}

function Eventos.criarMoeda(pai, pos, chave)
	local m = novaParte(pai, Vector3.new(0.4, 2.4, 2.4), CFrame.new(pos), Color3.fromRGB(255, 200, 40), Enum.Material.Neon, {
		Shape = Enum.PartType.Cylinder, CanCollide = false, Name = "Moeda",
	})
	table.insert(Eventos.moedas, m)
	m.Touched:Connect(function(hit)
		local p = jogadorDoToque(hit)
		if not p or not m.Parent then return end
		if chave then Estado.coletados[chave] = true end
		m:Destroy()
		darMoedas(p, 1)
	end)
	return m
end

function Eventos.criarEspinhos(pai, centro, y0, nivel)
	local grupo = Instance.new("Model")
	grupo.Name = "Espinhos"
	grupo:SetAttribute("Y0", y0)
	grupo:SetAttribute("Dano", Config.dificuldade(nivel).dano)
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
	table.insert(Eventos.espinhos, grupo)
end

function Eventos.criarBau(pai, centro, y0, nivel, chave)
	local bau = Instance.new("Model")
	bau.Name = "Bau"
	local corpo = novaParte(bau, Vector3.new(4, 2.5, 3), CFrame.new(centro.X, y0 + 1.25, centro.Z), Color3.fromRGB(120, 72, 30), Enum.Material.Wood)
	novaParte(bau, Vector3.new(4.2, 0.6, 3.2), CFrame.new(centro.X, y0 + 2.8, centro.Z), Color3.fromRGB(240, 190, 50), Enum.Material.Metal)
	bau.Parent = pai
	corpo.Touched:Connect(function(hit)
		local p = jogadorDoToque(hit)
		if not p or not bau.Parent then return end
		Estado.coletados[chave] = true
		bau:Destroy()
		local premio = 10 + nivel * 3
		darMoedas(p, premio)
		anunciar(p, "BAÚ! +" .. premio .. " moedas", Color3.fromRGB(255, 210, 60), 2)
	end)
end

function Eventos.criarPadVelocidade(pai, centro, y0)
	local pad = novaParte(pai, Vector3.new(C - 6, 0.2, C - 6), CFrame.new(centro.X, y0 + 0.1, centro.Z), Color3.fromRGB(40, 230, 255), Enum.Material.Neon, {
		Name = "PadVelocidade",
	})
	pad.Touched:Connect(function(hit)
		local p = jogadorDoToque(hit)
		if not p or emCooldown(p, "pad", 2) then return end
		Estado.jogadores[p].padAte = os.clock() + 5
		Estado.aplicarVelocidade(p)
		task.delay(5.1, Estado.aplicarVelocidade, p)
		anunciar(p, "VELOCIDADE!", Color3.fromRGB(40, 230, 255), 1.2)
	end)
end

function Eventos.criarPortal(pai, centro, nivel)
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
		Estado.hooks.teleportar(p, nivel, gx + salto(), gz + salto())
		anunciar(p, "PORTAL! Você foi jogado para longe", Color3.fromRGB(200, 120, 255), 2.5)
	end)
end

function Eventos.criarEscada(pai, centro, y0, nivel, direcao)
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
		if not p or Estado.nivelDe(p) ~= nivel or emCooldown(p, "subir", 2) then return end
		Estado.hooks.subirNivel(p, gx, gz)
	end)
end

return Eventos

-- Script (normal, não LocalScript) chamado: Principal
-- Carrega o labirinto em volta dos jogadores, anima os objetos e cuida dos jogadores.

local Players = game:GetService("Players")
local Lighting = game:GetService("Lighting")

local Config = require(script.Parent.Config)
local Estado = require(script.Parent.Estado)
local Eventos = require(script.Parent.Eventos)
local Mundo = require(script.Parent.Mundo)

local CFG, C = Config.CFG, Config.C

---------------------------------------------------------------------
-- CARREGAR / DESCARREGAR PEDAÇOS
---------------------------------------------------------------------
task.spawn(function()
	while true do
		local queridos = {}
		for _, p in Players:GetPlayers() do
			local st = Estado.jogadores[p]
			local hrp = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
			if st and hrp then
				local nivel = Estado.nivelDe(p)
				-- caiu para fora do labirinto: volta ao checkpoint
				if hrp.Position.Y < Config.alturaNivel(nivel) - 40 then
					Mundo.teleportar(p, st.checkpoint.nivel, st.checkpoint.gx, st.checkpoint.gz)
				end
				local pcx, pcz = Mundo.pedacoDe(hrp.Position)
				local construidos = 0
				for dx = -CFG.RAIO_DESCARGA, CFG.RAIO_DESCARGA do
					for dz = -CFG.RAIO_DESCARGA, CFG.RAIO_DESCARGA do
						local k = Mundo.chavePedaco(nivel, pcx + dx, pcz + dz)
						queridos[k] = true
						if math.abs(dx) <= CFG.RAIO and math.abs(dz) <= CFG.RAIO and not Mundo.carregados[k] then
							Mundo.garantirPedaco(nivel, pcx + dx, pcz + dz)
							construidos += 1
							if construidos % 2 == 0 then task.wait() end
						end
					end
				end
			end
		end
		for k, modelo in Mundo.carregados do
			if not queridos[k] then
				modelo:Destroy()
				Mundo.carregados[k] = nil
			end
		end
		task.wait(0.4)
	end
end)

---------------------------------------------------------------------
-- ESPINHOS E MOEDAS
---------------------------------------------------------------------
-- espinhos sobem e descem
task.spawn(function()
	while true do
		task.wait(1.4)
		Eventos.espinhosErguidos = not Eventos.espinhosErguidos
		for i = #Eventos.espinhos, 1, -1 do
			local g = Eventos.espinhos[i]
			if not g.Parent then
				table.remove(Eventos.espinhos, i)
			else
				local y0 = g:GetAttribute("Y0")
				local alvo = Eventos.espinhosErguidos and (y0 + 1.1) or (y0 - 1.2)
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
		if Eventos.espinhosErguidos then
			for _, p in Players:GetPlayers() do
				local char = p.Character
				local hrp = char and char:FindFirstChild("HumanoidRootPart")
				local hum = char and char:FindFirstChildOfClass("Humanoid")
				if hrp and hum and hum.Health > 0 then
					for _, g in Eventos.espinhos do
						if g.Parent then
							local c = g:GetAttribute("Centro")
							local d = hrp.Position - c
							if math.abs(d.X) < C / 2 - 2 and math.abs(d.Z) < C / 2 - 2 and math.abs(d.Y) < 4 then
								if not Estado.emCooldown(p, "espinho", 0.8) then
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
		for i = #Eventos.moedas, 1, -1 do
			local m = Eventos.moedas[i]
			if not m.Parent then
				table.remove(Eventos.moedas, i)
			else
				m.CFrame *= CFrame.Angles(0, 0.12, 0)
			end
		end
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

	Estado.jogadores[p] = {
		checkpoint = { nivel = 1, gx = 0, gz = 0 },
		padAte = 0,
		cool = {},
		ui = Estado.criarUI(p),
	}
	nivel.Changed:Connect(function() Estado.atualizarInfo(p) end)
	moedasV.Changed:Connect(function() Estado.atualizarInfo(p) end)
	Estado.atualizarInfo(p)

	local function aoNascer(char)
		char:WaitForChild("HumanoidRootPart", 10)
		task.wait()
		local st = Estado.jogadores[p]
		if st then
			Mundo.teleportar(p, st.checkpoint.nivel, st.checkpoint.gx, st.checkpoint.gz)
		end
		Estado.aplicarVelocidade(p)
		if Lighting.ClockTime < 5 then Estado.lanternas(true) end
	end
	p.CharacterAdded:Connect(aoNascer)
	if p.Character then task.spawn(aoNascer, p.Character) end

	task.delay(2, function()
		Estado.anunciar(p, "Ache a escada dourada para subir de nível!", Color3.fromRGB(255, 220, 70), 4)
	end)
end

Players.PlayerAdded:Connect(aoEntrar)
for _, p in Players:GetPlayers() do task.spawn(aoEntrar, p) end
Players.PlayerRemoving:Connect(function(p) Estado.jogadores[p] = nil end)

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
Mundo.garantirPedaco(1, 0, 0)

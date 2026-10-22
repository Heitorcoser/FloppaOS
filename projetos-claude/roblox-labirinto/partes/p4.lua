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


-- Script (normal, não LocalScript) chamado: EventosGlobais
-- Eventos que atingem todos os jogadores de tempos em tempos.

local Players = game:GetService("Players")
local Lighting = game:GetService("Lighting")
local TweenService = game:GetService("TweenService")
local Debris = game:GetService("Debris")
local RunService = game:GetService("RunService")

local Config = require(script.Parent.Config)
local Estado = require(script.Parent.Estado)
local Eventos = require(script.Parent.Eventos)

local C, CFG = Config.C, Config.CFG

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

local function soltarFantasma(p)
	local hrp = p.Character and p.Character:FindFirstChild("HumanoidRootPart")
	if not hrp then return end
	local dif = Config.dificuldade(Estado.nivelDe(p))
	local ang = math.random() * math.pi * 2
	local inicio = hrp.Position + Vector3.new(math.cos(ang) * 45, 2, math.sin(ang) * 45)
	local f = Config.novaParte(Estado.pastaTemp, Vector3.new(5, 5, 5), CFrame.new(inicio), Color3.fromRGB(230, 240, 255), Enum.Material.Neon, {
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
		if dist < 4.5 and not Estado.emCooldown(p, "fantasma", 1) then
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
			Estado.lanternas(true)
			task.wait(20)
			TweenService:Create(Lighting, info, { ClockTime = base.ClockTime, Brightness = base.Brightness, Ambient = base.Ambient, OutdoorAmbient = base.OutdoorAmbient }):Play()
			Estado.lanternas(false)
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
					local nivel = Estado.nivelDe(p)
					local gx, gz = math.floor(hrp.Position.X / C), math.floor(hrp.Position.Z / C)
					for _ = 1, 10 do
						local pos = Config.centroCelula(nivel, gx + math.random(-3, 3), gz + math.random(-3, 3)) + Vector3.new(math.random(-3, 3), 0, math.random(-3, 3))
						local m = Eventos.criarMoeda(Estado.pastaTemp, pos, nil)
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
			Estado.ventoAte = os.clock() + 20
			for _, p in Players:GetPlayers() do Estado.aplicarVelocidade(p) end
			task.wait(20.1)
			for _, p in Players:GetPlayers() do Estado.aplicarVelocidade(p) end
		end,
	},
}

task.wait(30)
while true do
	local ev = EVENTOS[math.random(1, #EVENTOS)]
	Estado.anunciarTodos(ev.nome, ev.cor, 3.5)
	task.spawn(ev.rodar)
	task.wait(math.random(CFG.INTERVALO_EVENTO[1], CFG.INTERVALO_EVENTO[2]))
end

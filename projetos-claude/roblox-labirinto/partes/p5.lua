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

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


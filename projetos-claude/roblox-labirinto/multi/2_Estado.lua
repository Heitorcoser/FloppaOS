-- ModuleScript chamado: Estado
-- Dados dos jogadores, interface na tela, velocidade e cooldowns.

local Players = game:GetService("Players")

local Estado = {
	jogadores = {},  -- [player] = { checkpoint, padAte, cool, ui }
	coletados = {},  -- moedas e baús já pegos (não voltam ao recarregar)
	ventoAte = 0,    -- até quando o evento "vento" está ativo
	hooks = {},      -- funções preenchidas pelo módulo Mundo (teleportar, subirNivel)
}

Estado.pastaLabirinto = Instance.new("Folder")
Estado.pastaLabirinto.Name = "Labirinto"
Estado.pastaLabirinto.Parent = workspace

Estado.pastaTemp = Instance.new("Folder")
Estado.pastaTemp.Name = "LabirintoEventos"
Estado.pastaTemp.Parent = workspace

function Estado.nivelDe(p)
	local ls = p:FindFirstChild("leaderstats")
	return ls and ls.Nivel.Value or 1
end

function Estado.criarUI(p)
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

function Estado.atualizarInfo(p)
	local st = Estado.jogadores[p]
	local ls = p:FindFirstChild("leaderstats")
	if st and ls then
		st.ui.info.Text = "Nível " .. ls.Nivel.Value .. "  •  🪙 " .. ls.Moedas.Value
	end
end

function Estado.anunciar(p, texto, cor, duracao)
	local st = Estado.jogadores[p]
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

function Estado.anunciarTodos(texto, cor, duracao)
	for _, p in Players:GetPlayers() do
		Estado.anunciar(p, texto, cor, duracao)
	end
end

function Estado.darMoedas(p, qtd)
	local ls = p:FindFirstChild("leaderstats")
	if ls then
		ls.Moedas.Value += qtd
	end
end

-- velocidade: normal 16, vento 26, pad 34
function Estado.aplicarVelocidade(p)
	local hum = p.Character and p.Character:FindFirstChildOfClass("Humanoid")
	local st = Estado.jogadores[p]
	if not hum or not st then return end
	local agora = os.clock()
	local v = 16
	if Estado.ventoAte > agora then v = 26 end
	if st.padAte > agora then v = 34 end
	hum.WalkSpeed = v
end

function Estado.emCooldown(p, nome, segundos)
	local st = Estado.jogadores[p]
	if not st then return true end
	local agora = os.clock()
	if (st.cool[nome] or 0) > agora then return true end
	st.cool[nome] = agora + segundos
	return false
end

-- liga ou desliga a lanterna de todos os jogadores
function Estado.lanternas(ligar)
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

return Estado

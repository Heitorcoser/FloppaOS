-- ModuleScript chamado: Gerador
-- Gera o desenho do labirinto de cada pedaço (sempre igual para a mesma posição).

local Config = require(script.Parent.Config)

local N, hash = Config.N, Config.hash
local Gerador = {}

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
function Gerador.gerarLabirinto(nivel, cx, cz)
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

-- direções por onde dá para sair de uma célula
function Gerador.saidas(m, i, j)
	local r = {}
	if (i > 0 and not m.leste[i - 1][j]) or (i == 0 and m.oeste[j]) then table.insert(r, Vector3.new(-1, 0, 0)) end
	if (i < N - 1 and not m.leste[i][j]) or (i == N - 1 and m.bordaLeste[j]) then table.insert(r, Vector3.new(1, 0, 0)) end
	if (j > 0 and not m.sul[i][j - 1]) or (j == 0 and m.norte[i]) then table.insert(r, Vector3.new(0, 0, -1)) end
	if (j < N - 1 and not m.sul[i][j]) or (j == N - 1 and m.bordaSul[i]) then table.insert(r, Vector3.new(0, 0, 1)) end
	return r
end

return Gerador

# Comandos rápidos de Git

Execute na raiz do repositório. Substitua `sua-branch`, `branch-destino` e
`branch-origem` pelos nomes reais. O exemplo de branch de trabalho abaixo é
`codex/minha-alteracao`.

## Consultar e trocar de branch

```powershell
git status
git diff
git branch
git branch -r
git branch --show-current
git log --oneline -5
```

`status` mostra arquivos alterados e preparados para commit. `diff` mostra
alterações ainda não preparadas. `branch` lista branches locais; `branch -r`
lista as referências remotas conhecidas.

Trocar para uma branch local existente:

```powershell
git switch sua-branch
```

Criar uma branch a partir da atual e já entrar nela:

```powershell
git switch -c codex/minha-alteracao
```

Confira `git status` antes de trocar. Finalize o trabalho pendente ou guarde-o
conscientemente antes de atualizar ou integrar branches.

## Atualizar antes de começar

Na branch desejada, com o diretório de trabalho limpo:

```powershell
git fetch origin
git pull --ff-only
```

`fetch` atualiza as referências do remoto. `pull --ff-only` atualiza a branch
atual a partir da remota que ela acompanha, somente se não precisar criar
um merge. Se houver divergência, confira o histórico e combine a integração
com o time; não use comandos de descarte para forçar a atualização.

Sem uma branch remota acompanhada, informe explicitamente:

```powershell
git pull --ff-only origin sua-branch
```

## Salvar e enviar

Depois de editar e verificar seu trabalho:

```powershell
git status
git diff
git add README.md docs/inicio/
git diff --cached
git commit -m "docs: atualiza guia de inicio do projeto"
git push -u origin codex/minha-alteracao
```

O `add` acima prepara os arquivos deste exemplo de documentação; para outro
trabalho, informe os caminhos correspondentes. Use `git add .` somente após
conferir que todas as mudanças devem entrar no commit. `diff --cached`
permite revisar exatamente o que será salvo.

`commit` salva localmente; `push` envia ao remoto. O `-u` configura a branch
remota acompanhada. Nos próximos envios da mesma branch, basta `git push`.
Não inclua `.env`, segredos, uploads ou arquivos gerados.

## Integrar com merge

O merge traz a origem **para a branch em que você está**. Com tudo salvo e
o diretório de trabalho limpo:

```powershell
git switch branch-destino
git pull --ff-only
git merge branch-origem
```

Confirme a branch de destino usada pelo time; não presuma `main` ou `master`.
`branch-origem` deve existir localmente; para integrar uma referência remota,
execute `git fetch origin` e use `origin/branch-origem`.
Depois do merge, execute as verificações relevantes e envie com `git push`,
se esse for o fluxo do time. Se a integração ocorrer por Pull Request, envie
sua branch e abra o PR em vez de fazer merge local na branch compartilhada.

Em caso de conflito:

1. Execute `git status` para identificar os arquivos.
2. Edite os trechos entre `<<<<<<<`, `=======` e `>>>>>>>`, resolva o conteúdo
   e remova os marcadores.
3. Revise e prepare com `git add caminho-do-arquivo`.
4. Execute `git commit` para concluir o merge e verifique antes de enviar.

Para cancelar um merge em andamento, use `git merge --abort`.

## Depois do pull

Confira o que mudou. Atualize as dependências quando necessário e siga o
[guia sem Docker](sem-docker.md#próximas-execuções) ou o
[guia com Docker](com-docker.md#3-consultar-parar-e-iniciar-novamente).
Migrations recebidas precisam ser aplicadas; no Docker, isso ocorre quando
o backend inicia. Envie migrations junto com os models quando houver mudança
de schema.

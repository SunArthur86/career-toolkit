# Git

> 共 15 题

## 1. rebase和merge的区别？

> **难度**: easy | **分类**: Git | **ID**: 46

#### 🎯 本质
**merge**保留完整的分支历史，创建一个合并提交。**rebase**将当前分支的提交"重放"到目标分支之上，产生线性的提交历史。两者都是合并代码的方式，但对历史记录的影响不同。

#### 🧒 类比
merge像两个故事各自写完后用订书机订在一起（保留两条线），rebase像把一个故事拆开重新插入另一个故事中间（合成一条线）。

#### 📊 图解
merge(保留分支历史):
  A---B---C  feature
 /         
D---E---F---M  main
         ↑ merge commit M

rebase(线性历史):
  A---B---C  feature
 /
D---E---F  main

rebase后:
D---E---F---A---B---C  main
         ↑ 线性,无合并提交

核心原则:
  公共分支(main/develop)用merge
  私有分支(feature)用rebase
  ⚠️ 永远不要rebase公共分支!
#### 🔧 详解
**merge的优点**：保留完整历史，安全不丢失信息，可回溯。**rebase的优点**：历史线性整洁，git log清晰，bisect更高效。**rebase的风险**：改变提交的hash，公共分支rebase会导致他人历史冲突。建议在push之前用interactive rebase（git rebase -i）整理提交。

#### 💻 代码
// merge方式
 git checkout main
 git merge feature
 // 产生合并提交,保留分支历史

// rebase方式
 git checkout feature
 git rebase main
 // 将feature的提交重放到main之上
 // 然后快进合并:
 git checkout main
 git merge feature  // fast-forward

// 交互式rebase(整理提交)
 git rebase -i HEAD~3
 // 可: squash合并提交, reword改消息
 // drop删除提交, reorder调整顺序

// 冲突处理
 git rebase --continue  // 解决后继续
 git rebase --abort     // 放弃rebase
#### ❓ 追问
什么是golden rule of rebase？答：永远不要对公共分支做rebase。squash merge是什么？答：git merge --squash将分支所有提交压缩为一个，适合feature分支合入。

---
## 2. git cherry-pick是什么？

> **难度**: medium | **分类**: Git | **ID**: 69

#### 🎯本质
cherry-pick是将**某个指定commit的变更**移植到当前分支，而不合并整个分支。相当于从一棵樱桃树上摘一颗樱桃（某个commit）放到另一棵树上。

#### 🧒类比
cherry-pick像从别人的作业本上抄一道题的解法到自己本子上——不需要抄整本，只要那一道题。

#### 📊图解
场景: develop分支有commit abc123
你想把这个修复合到master

develop: A---B---C(abc123)---D
master:  X---Y---Z

执行: git checkout master
      git cherry-pick abc123

master: X---Y---Z---C'(新的commit)
  注意: commit hash变了(abc123→新hash)
  因为commit包含了父节点信息

常用选项:
  git cherry-pick abc123 def456  // 多个
  git cherry-pick abc123..def456 // 范围
  git cherry-pick --abort        // 放弃
  git cherry-pick --continue     // 解决冲突后继续
  git cherry-pick -n abc123      // 只改文件不自动commit
#### 🔧详解
cherry-pick会**创建新的commit**（hash不同），因为commit包含父节点信息。如果cherry-pick的commit依赖之前的commit，可能产生冲突需手动解决。典型场景：**热修复**（从develop挑到master）、**功能移植**（从feature挑到release分支）。

#### 💻代码
// 典型工作流:热修复
// 1. 在develop上修复了bug
git commit -m "fix: 修复登录页白屏bug"
// 记下commit hash: abc123

// 2. 将修复合到master
git checkout master
git cherry-pick abc123
git push origin master

// 3. 如果有冲突
git cherry-pick abc123
// CONFLICT! 手动解决冲突
git add .
git cherry-pick --continue

// 批量cherry-pick(范围)
git cherry-pick abc123..def456
// 注意:范围是左开右闭(不含abc123)

// 查看哪些commit还没被pick
git log --oneline --left-right develop...master
// 
#### ❓追问
cherry-pick和merge的区别？答：merge合并整个分支，cherry-pick只取指定commit。cherry-pick后hash为什么变了？答：commit的hash由内容+父节点+时间戳等计算，cherry-pick到新分支父节点变了，所以hash变了。如何避免重复cherry-pick？答：git会检测patch-id，已经pick过的会跳过。

---
## 3. git stash的使用场景？

> **难度**: medium | **分类**: Git | **ID**: 70

#### 🎯本质
git stash用于**临时保存当前工作区的修改**（包括暂存区），让工作区恢复到干净状态，方便切换分支处理其他任务。处理完后再恢复之前的修改继续工作。

#### 🧒类比
stash像暂停按钮——你在写作业（当前分支），突然要接个电话（紧急bug），把作业草稿塞进抽屉（stash），接完电话再拿出来继续写。

#### 📊图解
工作流程:
1. 正在开发feature,改了一堆文件
2. 突然要修紧急bug
3. git stash → 修改被暂存,工作区干净
4. git checkout hotfix-branch
5. 修bug,commit,push
6. git checkout feature
7. git stash pop → 恢复之前的修改

常用命令:
git stash              暂存所有修改
git stash -u           含未跟踪文件
git stash -m "消息"    加备注
git stash list         查看暂存列表
  stash@{0}: On feature: 消息
git stash pop          恢复+删除最新stash
git stash apply        只恢复不删除
git stash apply stash@{1} 恢复指定stash
git stash drop stash@{0} 删除指定stash
git stash clear        清空所有stash
#### 🔧详解
stash保存的是**工作区和暂存区的差异**，不含未跟踪文件（加-u才包含）。多个stash形成栈结构（后进先出）。stash pop = stash apply + stash drop。如果pop时有冲突，需要手动解决，stash不会被自动删除。

#### 💻代码
// 场景:紧急修bug
// 1. 保存当前工作
git stash save "WIP: 用户列表功能"
git stash list
// stash@{0}: On feature/user-list: WIP

// 2. 切分支修bug
git checkout main
git checkout -b hotfix/login-bug
// ... 修bug ...
git commit -am "fix: 修复登录白屏"
git push origin hotfix/login-bug

// 3. 回到feature继续开发
git checkout feature/user-list
git stash pop
// 恢复之前的所有修改!

// 高级:部分stash(交互式选择文件)
git stash -p
// 会逐个文件询问是否stash

// 从stash创建分支
git stash branch new-feature stash@{0}
// 基于stash创建新分支并应用
#### ❓追问
stash pop冲突了怎么办？答：手动解决冲突后，git add标记已解决，然后git stash drop删除该stash。stash能跨分支使用吗？答：可以，stash是全局的，任何分支都能apply。stash和commit的区别？答：stash是临时的（不产生commit记录），commit是永久的（进入历史记录）。

---
## 4. 如何撤销commit？

> **难度**: easy | **分类**: Git | **ID**: 71

#### 🎯本质
撤销commit有两种思路：**reset**（时光倒流，修改历史）和**revert**（创建反向commit，保留历史）。reset适合本地未push的commit，revert适合已push到远程的commit。

#### 🧒类比
reset像用橡皮擦擦掉写错的字（历史消失了），revert像在错字旁边写个更正（错字还在，但被修正了）。

#### 📊图解
git reset三种模式:
--soft:  撤销commit,修改保留在暂存区
         HEAD~1 → 只动HEAD
--mixed: 撤销commit+add,修改保留在工作区
         (默认模式) HEAD~1 → 动HEAD+暂存区
--hard:  全部撤销,修改丢失!
         HEAD~1 → 动HEAD+暂存区+工作区
         ⚠️ 不可恢复(除非有reflog)

git revert:
  创建一个新的反向commit
  原commit还在历史中
  适合已push的公共分支

选择策略:
  未push的本地commit → reset
  已push的公共commit → revert
  永远不要reset已push的commit!
#### 🔧详解
**reset --soft**最安全，只回退commit指针，代码和暂存区不变，可重新编辑后commit。**reset --hard**最危险，所有修改丢失，但可通过git reflog找回（默认保留30天）。**revert**是安全的撤销方式，因为它不修改历史，只是新增一个抵消commit。

#### 💻代码
// 撤销最近一次commit(未push)
git reset --soft HEAD~1
// commit撤销了,代码还在暂存区
// 可以修改后重新commit

// 撤销最近2次commit
git reset --soft HEAD~2

// 撤销commit且取消暂存
git reset HEAD~1  // 等同于--mixed

// 撤销已push的commit(安全)
git revert abc123
// 会打开编辑器输入revert消息
// 生成新commit: "Revert 原commit消息"

// 撤销多个连续commit
git revert HEAD~3..HEAD

// reflog救命(找回误删的commit)
git reflog
// abc123 HEAD@{0}: reset: moving to HEAD~1
// def456 HEAD@{1}: commit: 重要功能
git reset --hard def456  // 恢复!
#### ❓追问
reset --hard后如何恢复？答：用git reflog找到之前的commit hash，然后git reset --hard恢复。revert产生冲突怎么办？答：和merge冲突一样处理，解决后git revert --continue。如何撤销merge commit？答：git revert -m 1 ，-m 1指定保留第一个父分支。

---
## 5. Git基本工作流程？

> **难度**: easy | **分类**: Git | **ID**: 289

#### 🎯 本质
Git工作流程：**工作区→暂存区→仓库→远程**。add提交到暂存、commit提交到仓库、push推送到远程。

#### 🧒 类比
Git像快递系统——打包(add)→仓库暂存(commit)→发出(push)。

#### 📊 图解
工作区 → git add → 暂存区 → git commit → 本地仓库 → git push → 远程仓库

状态:
Untracked → Staged → Committed → Pushed
#### 🔧 详解
git status查看当前状态。git add将修改加入暂存区。git commit将暂存区的内容提交到本地仓库。git push将本地提交推送到远程。git pull=fetch+merge。

#### 💻 代码
git status
# 修改文件
git add .
git commit -m 'feat: add user auth'
git push origin main

# 拉取最新
git pull origin main
# 查看历史
git log --oneline --graph
#### ❓ 追问
git add .和git add -A的区别？答：-A包含删除的文件，.在新版Git中相同。

---
## 6. Git分支管理？

> **难度**: medium | **分类**: Git | **ID**: 290

#### 🎯 本质
分支是**独立的开发线路**。创建/切换/合并/删除分支。merge和rebase两种合并方式。

#### 🧒 类比
分支像平行宇宙——在另一条时间线开发，完成后合并回主线。

#### 📊 图解
分支操作:
git branch: 列出分支
git branch name: 创建
git checkout -b name: 创建+切换
git merge name: 合并
git branch -d name: 删除

合并方式:
merge: 保留历史(三方合并)
rebase: 线性历史(变基)
#### 🔧 详解
merge创建合并提交保留完整历史。rebase将当前分支的提交重新应用到目标分支上(线性历史更干净)。不要对公共分支rebase(改写历史)。fast-forward如果目标分支没有新提交则直接移动指针。

#### 💻 代码
// 创建功能分支
git checkout -b feature/login
// 开发完成后合并
git checkout main
git merge feature/login
# 或用rebase
 git checkout feature/login
git rebase main
git checkout main
git merge feature/login
# 解决冲突后
git rebase --continue
#### ❓ 追问
merge和rebase怎么选？答：公共分支用merge，个人分支可以用rebase。rebase的风险？答：改写公共分支历史导致其他人代码丢失。

---
## 7. Git冲突解决？

> **难度**: medium | **分类**: Git | **ID**: 291

#### 🎯 本质
当**同一文件的同一位置**被不同分支修改时产生冲突，需要手动解决。

#### 🧒 类比
冲突像两个人同时改同一个文件——Git不知道以谁为准，需要你裁决。

#### 📊 图解
冲突标记:
>>>>>> feature-branch

解决步骤:
1.打开冲突文件
2.选择保留哪个修改
3.删除冲突标记
4.git add → git commit
#### 🔧 详解
冲突标记>>>>>>(对方)。解决冲突：保留需要的代码删掉标记。也可以选择用某一方的版本：git checkout --theirs/--ours。解决后git add标记为已解决。

#### 💻 代码
// 查看冲突文件
git diff --name-only --diff-filter=U
// 使用某一方的版本
git checkout --theirs conflicted-file.js
git checkout --ours conflicted-file.js
// 用VSCode解决
code . # 打开编辑器用可视化工具
// 解决后
git add .
git commit -m 'merge: resolve conflicts'
#### ❓ 追问
如何减少冲突？答：频繁pull、小粒度提交、合理拆分文件。什么是git rerere？答：记录冲突解决方式自动重用。

---
## 8. Git内部原理？

> **难度**: hard | **分类**: Git | **ID**: 292

#### 🎯 本质
Git本质是**内容寻址文件系统**。所有内容用SHA-1哈希索引。blob/tree/commit/tag四种对象。

#### 🧒 类比
Git像图书馆——每本书(对象)按编号(SHA-1)存放，目录(tree)记录位置。

#### 📊 图解
Git对象:
blob: 文件内容(不包含文件名)
tree: 目录结构(文件名→blob引用)
commit: 快照(指向tree+父commit)
tag: 标签(指向commit)

存储: .git/objects/
#### 🔧 详解
SHA-1(40位)是对象唯一标识。blob只存文件内容(相同内容只存一份)。tree存目录结构和文件名。commit指向一个tree(项目快照)和父commit。branch只是指向commit的可移动指针。HEAD指向当前分支。

#### 💻 代码
// 查看Git对象
git cat-file -t HEAD  # commit
git cat-file -p HEAD  # 查看commit内容
git cat-file -p HEAD^{tree} # 查看tree
# 手动创建blob
echo 'hello' | git hash-object --stdin -w
git cat-file -p  # hello
#### ❓ 追问
什么是松散对象和打包文件？答：松散对象是单独文件，gc后打包为packfile节省空间。

---
## 9. Git stash和cherry-pick？

> **难度**: medium | **分类**: Git | **ID**: 293

#### 🎯 本质
**stash**暂存未提交的修改。**cherry-pick**挑选某个提交应用到当前分支。

#### 🧒 类比
stash像把工作台上的东西暂时收进抽屉，cherry-pick像从别的订单里复制一道菜。

#### 📊 图解
stash:
git stash: 暂存修改
git stash list: 查看
git stash pop: 恢复+删除
git stash apply: 恢复不删除

cherry-pick:
git cherry-pick : 应用指定提交
git cherry-pick A..B: 应用范围
#### 🔧 详解
stash保存工作区和暂存区的修改(可以多次stash)。适合：紧急切分支修bug。cherry-pick将指定提交的修改应用到当前分支。适合：某个功能分支的某个提交需要同步到其他分支。

#### 💻 代码
// stash
git stash save 'work in progress'
git checkout hotfix-branch
// 修bug...
git checkout feature-branch
git stash pop

// cherry-pick
git log --oneline feature-branch
# abc1234 fix: security patch
git checkout main
git cherry-pick abc1234
#### ❓ 追问
cherry-pick冲突怎么办？答：解决冲突后git cherry-pick --continue。stash能跨分支吗？答：可以，stash存在仓库级别不绑定分支。

---
## 10. git reset和revert？

> **难度**: easy | **分类**: Git | **ID**: 294

#### 🎯 本质
**reset**移动HEAD指针(回退历史)。**revert**创建新提交(撤销指定提交)。revert更安全。

#### 🧒 类比
reset像删除历史记录，revert像写一条新记录说'前面的作废'——不改变历史。

#### 📊 图解
reset模式:
--soft: 只移HEAD(暂存区保留)
--mixed: 移HEAD+重置暂存区(默认)
--hard: 移HEAD+重置暂存区+工作区

revert:
git revert : 创建新提交撤销指定提交
#### 🔧 详解
reset是回退指针改写历史(慎用)。soft保留修改在暂存区。mixed(默认)保留修改在工作区。hard完全丢弃所有修改。revert是安全的撤销方式(创建新提交不改写历史)。

#### 💻 代码
// reset: 回退上一次提交
git reset --soft HEAD~1  # 保留修改在暂存区
git reset --mixed HEAD~1 # 保留修改在工作区
git reset --hard HEAD~1 # 丢弃所有修改⚠️

// revert: 撤销指定提交
git revert abc1234 # 创建新提交撤销abc1234的修改
#### ❓ 追问
reset --hard后怎么恢复？答：git reflog查看历史然后reset回去。为什么公共分支不要reset？答：改写历史导致其他人代码丢失。

---
## 11. Git hooks？

> **难度**: medium | **分类**: Git | **ID**: 295

#### 🎯 本质
Git hooks是**特定事件触发时自动执行的脚本**。客户端hooks(pre-commit/commit-msg等)和服务端hooks。

#### 🧒 类比
hooks像自动门——当有人进来(提交代码)时自动触发动作(检查/通知)。

#### 📊 图解
客户端hooks:
pre-commit: 提交前(lint)
commit-msg: 提交信息检查
pre-push: 推送前(测试)
post-merge: 合并后(install)

工具:
Husky: 简化hook管理
lint-staged: 只检查暂存文件
#### 🔧 详解
hooks存放在.git/hooks/目录。Husky简化hooks管理(package.json中配置)。lint-staged只对暂存区文件运行lint(提高效率)。commitlint检查提交信息格式(Conventional Commits)。

#### 💻 代码
// Husky + lint-staged
npm install husky lint-staged -D
npx husky install
npx husky add .husky/pre-commit 'npx lint-staged'

// package.json
{
  "lint-staged":{
    "*.{js,ts}":["eslint --fix","prettier --write"],
    "*.css":["prettier --write"]
  }
}
// commitlint
npx husky add .husky/commit-msg 'npx commitlint --edit $1'
#### ❓ 追问
什么是Conventional Commits？答：feat:/fix:/docs:等前缀的提交信息规范。

---
## 12. Git submodules？

> **难度**: medium | **分类**: Git | **ID**: 296

#### 🎯 本质
Submodule允许**在一个Git仓库中嵌入另一个Git仓库**。用于引用共享库/组件。

#### 🧒 类比
submodule像在一个楼盘里建了另一个楼盘的展示厅——两个楼盘独立管理但有关联。

#### 📊 图解
操作:
git submodule add : 添加
git submodule init: 初始化
git submodule update: 更新

克隆含submodule的项目:
git clone --recursive 
#### 🔧 详解
submodule指向特定commit(不是分支)。更新submodule需要在子模块目录中pull。克隆含submodule的项目需要--recursive。缺点：操作复杂、版本管理麻烦。替代方案：npm包/Monorepo。

#### 💻 代码
// 添加子模块
git submodule add https://github.com/lib/shared.git libs/shared
git commit -m 'add shared submodule'

// 更新子模块
cd libs/shared
git pull origin main
cd ../..
git add libs/shared
git commit -m 'update shared to latest'

// 克隆含子模块的项目
git clone --recursive https://github.com/main-project.git
#### ❓ 追问
submodule的缺点？答：操作复杂、克隆慢、分支切换需手动更新。替代方案？答：npm私有包、pnpm workspace。

---
## 13. .gitignore的作用？

> **难度**: easy | **分类**: Git | **ID**: 297

#### 🎯 本质
.gitignore指定**Git应该忽略的文件和目录**。不追踪node_modules/build/.env等。

#### 🧒 类比
.gitignore像快递的黑名单——这些物品(文件)不接受投递(Git追踪)。

#### 📊 图解
常见忽略:
node_modules/
dist/ build/
.env
*.log
.DS_Store
coverage/

语法:
# 注释
/  目录
txt 所有.txt
! 反向(不忽略)
#### 🔧 详解
node_modules不提交(通过npm install恢复)。构建产物不提交(通过构建命令生成)。环境变量文件(.env)不提交(包含敏感信息)。OS生成文件(.DS_Store/Thumbs.db)不提交。

#### 💻 代码
// .gitignore
node_modules/
dist/
build/
.env
.env.local
*.log
.DS_Store
coverage/
.vscode/
!.env.example
#### ❓ 追问
已经提交的文件怎么忽略？答：git rm --cached 从追踪中移除但保留本地文件。

---
## 14. Git bisect二分查找bug？

> **难度**: medium | **分类**: Git | **ID**: 298

#### 🎯 本质
git bisect用**二分查找**快速定位引入bug的提交。自动在好的和坏的提交之间二分。

#### 🧒 类比
bisect像猜数字——告诉Git'这个版本有问题/没问题'，Git自动二分缩小范围。

#### 📊 图解
流程:
git bisect start
git bisect bad HEAD          # 当前有bug
git bisect good   # 这个版本正常
# Git自动checkout中间提交
# 测试后标记
git bisect good / bad
# 重复直到找到

git bisect reset  # 结束
#### 🔧 详解
告诉Git当前提交有bug(bad)和一个没bug的提交(good)。Git自动checkout中间的提交让你测试。你标记good或bad后Git继续二分。通常log2(n)步就能找到问题提交。可以自动化测试(git bisect run)。

#### 💻 代码
// 手动二分
git bisect start
git bisect bad HEAD
git bisect good v1.0.0
# Git checkout中间提交
# 运行测试...
git bisect good  # 或 bad
# 重复...
# 找到后
git bisect reset

// 自动化
git bisect run npm test
#### ❓ 追问
如何自动化bisect？答：git bisect run 让Git自动运行测试标记good/bad。

---
## 15. Git rebase交互模式？

> **难度**: medium | **分类**: Git | **ID**: 299

#### 🎯 本质
**交互式rebase**可以**编辑历史提交**：合并(squash)/编辑(edit)/重写(reword)/删除(drop)。

#### 🧒 类比
交互rebase像历史编辑器——可以修改、合并、删除过去的提交记录。

#### 📊 图解
命令:
git rebase -i HEAD~N  # 编辑最近N个提交

操作:
pick: 保留(默认)
reword: 修改提交信息
edit: 暂停修改内容
squash: 合并到上一个
drop: 删除
reorder: 调整顺序
#### 🔧 详解
交互rebase用于清理提交历史。squash将多个小提交合并为一个。reword修改提交信息。edit暂停让你修改提交内容。drop删除提交。不要对已推送的公共分支做交互rebase。

#### 💻 代码
// 合并最近3个提交
git rebase -i HEAD~3
# 编辑器中:
# pick abc1234 feat: add feature
# squash def5678 fix: typo
# squash ghi9012 fix: lint
# 保存后编辑合并后的提交信息

// 修改上一次提交信息
git commit --amend -m 'new message'
#### ❓ 追问
squash和fixup的区别？答：squash合并提交信息，fixup丢弃被合并的提交信息。

---

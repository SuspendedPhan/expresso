package main

type Frogger interface {
	Quack() string
	AddOne(number int) int
	Jump()
	JumpCount() int
	SetFriend(frogger Frogger)
	GetFriend() Frogger
}

type Frog struct {
	friend Frogger
	jumps  int
	id     string
}

func (f Frog) Quack() string {
	return "quacky"
}

func (f Frog) AddOne(number int) int {
	return number + 1
}

func (f *Frog) Jump() {
	f.jumps++
}

func (f Frog) JumpCount() int {
	return f.jumps
}

func (f *Frog) SetFriend(frogger Frogger) {
	f.friend = frogger
}

func (f Frog) GetFriend() Frogger {
	return f.friend
}

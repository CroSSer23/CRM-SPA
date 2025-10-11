import { getCurrentUser } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export async function Header() {
  const user = await getCurrentUser()

  if (!user) return null

  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()

  return (
    <header className="h-16 border-b bg-white flex items-center justify-end px-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-xs text-muted-foreground">{user.role}</p>
        </div>
        <Avatar>
          <AvatarFallback className="bg-primary text-primary-foreground">
            {initials}
          </AvatarFallback>
        </Avatar>
        <form action="/api/logout" method="POST">
          <Button type="submit" variant="ghost" size="sm">
            Sign Out
          </Button>
        </form>
      </div>
    </header>
  )
}

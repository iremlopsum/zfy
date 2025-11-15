import { Label } from '../../components/label'
import { Input } from '../../components/input'
import { Button } from '../../components/button'
import { StatePreviewCard } from '../../components/state-preview-card'
import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from '../../components/card'

import userStore from '../../stores/user-store'
import {
  resetUser,
  updateName,
  incrementAge,
  decrementAge,
} from './demo-actions'

interface UserTabProps {
  theme: 'light' | 'dark'
}

export function UserTab({ theme }: UserTabProps) {
  const user = userStore((data) => data)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>User State</CardTitle>
          <CardDescription>Manage user information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={user.name}
              onChange={(e) => updateName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Age: {user.age}</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={decrementAge}
                className="flex-1"
              >
                -1
              </Button>
              <Button onClick={incrementAge} className="flex-1">
                +1
              </Button>
            </div>
          </div>

          <Button variant="destructive" onClick={resetUser} className="w-full">
            Reset User
          </Button>
        </CardContent>
      </Card>

      <StatePreviewCard
        state={user}
        theme={theme}
        infoMessage={
          <>
            <strong>{user.name}</strong> is <strong>{user.age}</strong> years
            old
          </>
        }
        infoBorderColor="border-purple-500"
      />
    </div>
  )
}

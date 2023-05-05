import type { NextApiRequest, NextApiResponse } from 'next'
import type { TableData } from 'types'
import { faker } from '@faker-js/faker'

const range = (len: number) => {
  const arr = []
  for (let i = 0; i < len; i++) {
    arr.push(i)
  }
  return arr
}

const capitalizeFirstLetter = (string: string) => {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const newData = (): TableData => {
  const companyName = capitalizeFirstLetter(faker.company.bsBuzz())
  return {
    id: faker.datatype.uuid(),
    name: companyName + ' x ' + capitalizeFirstLetter(faker.company.bsBuzz()),
    time: faker.date.between('2020-01-01T00:00:00.000Z', '2023-07-01T00:00:00.000Z').getTime(),
    account: companyName,
    nextSteps: range(Math.ceil(Math.random() * 5)).map(() => faker.lorem.sentence()),
  }
}

export const makeData = (len: number) => range(len).map(newData)

const handler = (req: NextApiRequest, res: NextApiResponse) => {
  const data = makeData(42)
  res.json(data)
}

export default handler

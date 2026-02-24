import React from 'react'
import MessageBox from '@/components/MessageBox'
import { Id } from '@/convex/_generated/dataModel';

const page = async ({params}: {params: {chatId: Id<"chats">}}) => {
  const {chatId} = await params
  return (
    <MessageBox chatId={chatId}/>
  )
}

export default page
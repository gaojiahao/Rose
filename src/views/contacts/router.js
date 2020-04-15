
import Contacts from '@/views/contacts/contacts'
import ContactItem from '@/views/contacts/contactItem'

export default [
    { 
        path: '/contacts', 
        name: 'CONTACTS', 
        component: Contacts,
        meta:{ 
          title:'通讯录' , 
        //   keepAlive: true
        },
        children: [
          {
              path:'/contactItem/:groupId',
              name:'contactItem',
              component:ContactItem,
              meta:{
                title:'通讯录详情' , 
                // keepAlive: true
              }
          }
        ]
    }
]
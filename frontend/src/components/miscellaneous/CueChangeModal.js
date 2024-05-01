import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  ButtonGroup,
} from '@chakra-ui/react';

const CueChangeModal = ({ isOpen, onClose, onUpdateStatus, onDeleteCue, onCopyCueId, selectedCue }) => {
  const handleStatusUpdate = (status) => {
    onUpdateStatus(status);
    onClose();
  };

  const handleMessageDelete = () => {
    onDeleteCue();
    onClose();
  };

const handleCopyCueId = () => {
    onCopyCueId();
    onClose();
  };

     const handleCopyMessageId = () => {
      const textArea = document.getElementById('messageCopy')
      textArea.select();
      document.execCommand('copy');
       
      
      // const textarea = document.createElement("textarea");
      //  textarea.value = selectedCue;
      //  document.body.appendChild(textarea);
      //  textarea.select();
      //  document.execCommand("copy");
      //  document.body.removeChild(textarea);
       
      //  setSelectedCue(null);
      //  toast({
      //    title: "Cue ID copied",
      //    status: "success",
      //    duration: 5000,
      //    isClosable: true,
      //    position: "bottom",
      //  });
     };


  

// const handleStatusUpdate = async () => {
//     try {
//         const confi = {
//           headers: {
//             Authorization: `Bearer ${user.token}`,
//           },
//         };
//         const {data} = await axios.put(
//             'api/message/:messageId/status/:status',
//             {
//                 messageId: selectedCue._id,
//                 status: status,
//             },
//             config            
//         )
        
//     } catch (error) {
//         toast({
//             title: "Error Occured!",
//             description: "Failed to set status",
//             status: "error",
//             duration: 5000,
//             isClosable: true,
//             position: "bottom-left",
//           });
//     }
//     }   


// const onUpdateStatus = async (status) => {
//   const messageId = 'your-message-id'; // Replace with actual message ID
//   const token = 'your-auth-token'; // Replace with actual auth token

//   try {
//     const response = await fetch(`/api/messages/${messageId}/status/${status}?token=${token}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         // Include other headers as required, such as authorization headers
//       },
//     });

//     if (!response.ok) {
//       throw new Error('Failed to update message status');
//     }

//     const updatedMessage = await response.json();
//     console.log('Message status updated:', updatedMessage);
//   } catch (error) {
//     console.error('Error updating message status:', error);
//   }
// };


  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Cue Status</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <ButtonGroup variant="outline" spacing="4">
            <Button
              colorScheme="red"
              onClick={() => handleStatusUpdate("live")}
            >
              Live
            </Button>
            <Button
              colorScheme="orange"
              onClick={() => handleStatusUpdate("standby")}
            >
              Standby
            </Button>
            <Button
              colorScheme="green"
              onClick={() => handleStatusUpdate("completed")}
            >
              Completed
            </Button>
            <Button
              colorScheme="blue"
              onClick={() => handleStatusUpdate("pending")}
            >
              Pending
            </Button>
          </ButtonGroup>
          <div className="message-id-box" style={{ marginTop: "20px" }}>
            <p>Cue ID:</p>
            <textarea id="messageCopy" readOnly style={{ width: "100%", marginBottom: "0px", height: "fit-content", resize: "none" }} >{selectedCue}</textarea>
          </div>
            <Button colorScheme="cyan" onClick={handleCopyMessageId}>Copy ID</Button>
        </ModalBody>
        <ModalFooter>
          <ButtonGroup>
          <Button colorScheme="red" onClick={() => handleMessageDelete()}>
            Delete Cue
          </Button>
          <Button onClick={onClose}>Cancel</Button>
            
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CueChangeModal;

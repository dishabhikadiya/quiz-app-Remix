import React, { useCallback, useEffect, useState } from "react";
import {
  Button,
  Card,
  Frame,
  LegacyStack,
  Modal,
  Page,
  TextField,
} from "@shopify/polaris";
import { MobileBackArrowMajor } from "@shopify/polaris-icons";
import {
  useActionData,
  useLocation,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { EditMajor } from "@shopify/polaris-icons";
import { DeleteMajor } from "@shopify/polaris-icons";
import pagecss from "../data.css";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const links = () => [{ rel: "stylesheet", href: pagecss }];
export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);
  const body = await request.formData();
  const quizId = body.get("quizId");
  const id = body.get("id");
  if (request.method === "POST") {
    const data = JSON.parse(body.get("data"));
    const create = await prisma.question.create({
      data: {
        ...data,
        quizId: quizId,
      },
    });

    return JSON.stringify(create);
  }
  if (request.method === "DELETE") {
    await prisma.question.delete({
      where: { id: id },
    });
  }
  if (request.method === "PUT") {
    const id = body.get("id");
    const editData = JSON.parse(body.get("editData"));

    const update = await prisma.question.update({
      where: { id: id },
      data: editData,
    });

    return JSON.stringify(update);
  }
  return null;
};
const list = () => {
  const nav = useNavigate();
  const submit = useSubmit();
  const map = useLocation();
  const TopicName = map?.state?.data?.topicName;
  const Questions = map?.state?.data;
  const quizId = map?.state?.data?.id;
  const action = useActionData();

  const [state, setState] = useState({
    modalType: null,
    id: "",
    question: "",
    answerA: "",
    answerB: "",
    answerC: "",
    answerD: "",
    correctAnswer: "",
  });

  const handleTextFieldChangeA = useCallback(
    (value) => setState({ ...state, answerA: value }),
    [state]
  );
  const handleTextFieldChangeB = useCallback(
    (value) => setState({ ...state, answerB: value }),
    [state]
  );
  const handleTextFieldChangeC = useCallback(
    (value) => setState({ ...state, answerC: value }),
    [state]
  );
  const handleTextFieldChangeD = useCallback(
    (value) => setState({ ...state, answerD: value }),
    [state]
  );

  const handleChange1 = useCallback(
    (id) => {
      setState({ ...state, modalType: "delete", id });
    },
    [state]
  );

  const handleChangee = useCallback(
    (id) => {
      setState({ ...state, modalType: "edit", id });
    },
    [state]
  );

  const handleCorrectAnswer = useCallback(
    (value) => setState({ ...state, correctAnswer: value }),
    [state]
  );

  const handleChange = useCallback(
    () => setState({ ...state, modalType: "create" }),
    [state]
  );

  const handleChangeQuestion = useCallback(
    (newValue) => setState({ ...state, question: newValue }),
    [state]
  );

  const handleCreate = () => {
    const data = {
      question: state.question,
      answerA: state.answerA,
      answerB: state.answerB,
      answerC: state.answerC,
      answerD: state.answerD,
      correctAnswer: state.correctAnswer,
    };
    submit(
      {
        data: JSON.stringify(data),
        topicName: TopicName,
        quizId: quizId,
      },
      { method: "POST" }
    );
  };

  const handleDelete = () => {
    submit({ id: state.id }, { method: "DELETE" });
    setState({ ...state, modalType: null, id: "" });
  };
  const handleEdit = () => {
    const editedQuestion = {
      question: state.question,
      answerA: state.answerA,
      answerB: state.answerB,
      answerC: state.answerC,
      answerD: state.answerD,
      correctAnswer: state.correctAnswer,
    };

    submit(
      {
        id: state.id,
        editData: JSON.stringify(editedQuestion),
      },
      { method: "PUT" }
    );

    setState({ ...state, modalType: null, id: "" });
  };

  useEffect(() => {
    if (action) {
      setState({
        modalType: null,
        id: "",
        question: "",
        answerA: "",
        answerB: "",
        answerC: "",
        answerD: "",
        correctAnswer: "",
      });
    }
  }, [action]);

  const renderModal = () => {
    switch (state.modalType) {
      case "create":
        return (
          <Modal
            open={state.modalType === "create"}
            onClose={() => setState({ ...state, modalType: null })}
            title="Create Quiz Name"
          >
            <Modal.Section>
              <TextField
                label="Question Name"
                value={state.question}
                onChange={handleChangeQuestion}
                autoComplete="off"
              />
              <br />
              <LegacyStack>
                <TextField
                  label="A"
                  value={state.answerA}
                  onChange={handleTextFieldChangeA}
                  autoComplete="off"
                />
                <TextField
                  label="B"
                  value={state.answerB}
                  onChange={handleTextFieldChangeB}
                  autoComplete="off"
                />
              </LegacyStack>
              <br />
              <LegacyStack>
                <TextField
                  label="C"
                  value={state.answerC}
                  onChange={handleTextFieldChangeC}
                  autoComplete="off"
                />
                <TextField
                  label="D"
                  value={state.answerD}
                  onChange={handleTextFieldChangeD}
                  autoComplete="off"
                />
              </LegacyStack>
              <br />
              <TextField
                label="Input the correctAnswer"
                value={state.correctAnswer}
                onChange={handleCorrectAnswer}
              />
              <br />
              <Button
                variant="primary"
                tone="success"
                submit
                onClick={() => {
                  handleCreate();
                }}
              >
                Save
              </Button>
              &nbsp;
              <Button onClick={handleChange}>Cancel</Button>
            </Modal.Section>
          </Modal>
        );
      case "delete":
        return (
          <Modal
            open={state.modalType === "delete"}
            onClose={() => setState({ ...state, modalType: null })}
            title="Delete"
          >
            <Modal.Section>
              <p>Are you sure you want to delete this Question?</p>
              <br />
              <br />
              <Button variant="primary" tone="critical" onClick={handleDelete}>
                Remove
              </Button>
              &nbsp;
              <Button onClick={handleChange1}>Cancel</Button>
            </Modal.Section>
          </Modal>
        );
      case "edit":
        return (
          <Modal
            open={state.modalType === "edit"}
            onClose={() => setState({ ...state, modalType: null })}
            title="Edit Quiz Name"
          >
            <Modal.Section>
              <TextField
                label="Question Name"
                value={state.question}
                onChange={handleChangeQuestion}
                autoComplete="off"
              />
              <br />
              <LegacyStack>
                <TextField
                  label="A"
                  value={state.answerA}
                  onChange={handleTextFieldChangeA}
                  autoComplete="off"
                />
                <TextField
                  label="B"
                  value={state.answerB}
                  onChange={handleTextFieldChangeB}
                  autoComplete="off"
                />
              </LegacyStack>
              <br />
              <LegacyStack>
                <TextField
                  label="C"
                  value={state.answerC}
                  onChange={handleTextFieldChangeC}
                  autoComplete="off"
                />
                <TextField
                  label="D"
                  value={state.answerD}
                  onChange={handleTextFieldChangeD}
                  autoComplete="off"
                />
              </LegacyStack>
              <br />
              <TextField
                label="Input the correctAnswer"
                value={state.correctAnswer}
                onChange={handleCorrectAnswer}
              />
              <br />
              <Button
                variant="primary"
                tone="success"
                submit
                onClick={() => {
                  handleEdit();
                }}
              >
                Save
              </Button>
              &nbsp;
              <Button onClick={handleChangee}>Cancel</Button>
            </Modal.Section>
          </Modal>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <Page
        title="Questions Page"
        primaryAction={
          <Button variant="primary" onClick={handleChange}>
            Add Question
          </Button>
        }
      >
        <Button
          icon={MobileBackArrowMajor}
          variant="tertiary"
          onClick={() => nav("/app/")}
        >
          Back To Home Page
        </Button>
        <div className="quiz">
          <div id="answer-buttons">
            {Questions?.question?.map((data, index) => (
              <React.Fragment key={index}>
                <Card>
                  <div className="card">
                    <h2 id="question">{data?.question}</h2>
                  </div>
                  <button className="btn">{data?.answerA}</button>
                  <button className="btn">{data?.answerB}</button>
                  <button className="btn">{data?.answerC}</button>
                  <button className="btn">{data?.answerD}</button>

                  <div className="btn-1">
                    <Button
                      icon={EditMajor}
                      onClick={() => handleChangee(data.id)}
                    ></Button>
                    &nbsp;&nbsp;
                    <Button
                      icon={DeleteMajor}
                      onClick={() => handleChange1(data.id)}
                    ></Button>
                  </div>
                </Card>
                <br />
                <br />
              </React.Fragment>
            ))}
          </div>
        </div>
      </Page>
      <Frame>{renderModal()}</Frame>
    </div>
  );
};

export default list;

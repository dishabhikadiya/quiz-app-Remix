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
import { json } from "@remix-run/node";
import { MobileBackArrowMajor } from "@shopify/polaris-icons";
import {
  useActionData,
  useLoaderData,
  useLocation,
  useNavigate,
  useParams,
  useSubmit,
} from "@remix-run/react";
import questions from "./questions";
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
    const id = body.get("id");

    await prisma.question.delete({
      where: { id: id },
    });
  }
  return null;
};
const list = () => {
  const nav = useNavigate();
  const submit = useSubmit();
  // const { id } = useParams();
  const map = useLocation();
  const TopicName = map?.state?.data?.topicName;
  const Questions = map?.state?.data;
  const questionId = Questions?.question?.map((data) => [data.id]);
  const quizId = map?.state?.data?.id;
  const action = useActionData();
  const loaderData = useLoaderData();
  const [active, setActive] = useState(false);
  const [id, setId] = useState();
  const [question, setQuestion] = useState();
  const [answerA, setAnswerA] = useState();
  const [answerB, setAnswerB] = useState();
  const [answerC, setAnswerC] = useState();
  const [answerD, setAnswerD] = useState();
  const [active1, setActiv1] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState();
  const handleTextFieldChangeA = useCallback((value) => setAnswerA(value), []);
  const handleTextFieldChangeB = useCallback((value) => setAnswerB(value), []);
  const handleTextFieldChangeC = useCallback((value) => setAnswerC(value), []);
  const handleTextFieldChangeD = useCallback((value) => setAnswerD(value), []);
  const handleChange1 = useCallback(() => setActiv1(!active1), [active1]);
  const handleCorrectAnswer = useCallback(
    (value) => setCorrectAnswer(value),
    []
  );
  const handleChange = useCallback(() => setActive(!active), [active]);
  const handleChangeQuestion = useCallback(
    (newValue) => setQuestion(newValue),
    []
  );
  const handleCreate = () => {
    const data = {
      question: question,
      answerA: answerA,
      answerB: answerB,
      answerC: answerC,
      answerD: answerD,
      correctAnswer: correctAnswer,
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
    submit({ id: id }, { method: "DELETE" });
  };
  useEffect(() => {
    if (action) {
      setActive(false);
      setActiv1(false);
    }
  }, [action]);
  return (
    <div>
      <Page
        title="Questions Page"
        primaryAction={
          <Button
            variant="primary"
            onClick={() => {
              handleChange();
            }}
          >
            Add Question
          </Button>
        }
      >
        <Button
          icon={MobileBackArrowMajor}
          variant="tertiary"
          onClick={() => {
            nav("/app/");
          }}
        >
          Back To Home Page
        </Button>
        <div className="quiz">
          <div id="answer-buttons">
            {Questions?.question?.map((data, index) => (
              <>
                <Card key={index}>
                  <div className="card">
                    <h2 id="question">{data?.question}</h2>
                  </div>
                  <button className="btn">{data?.answerA}</button>
                  <button className="btn">{data?.answerB}</button>
                  <button className="btn">{data?.answerC}</button>
                  <button className="btn">{data?.answerD}</button>

                  <div className="btn-1">
                    <Button icon={EditMajor}></Button>&nbsp;&nbsp;
                    <Button
                      icon={DeleteMajor}
                      onClick={() => {
                        handleChange1();
                        setId(data.id);
                      }}
                    ></Button>
                  </div>
                </Card>
                <br />
                <br />
              </>
            ))}
          </div>
        </div>
      </Page>
      <Frame>
        <Modal open={active} onClose={handleChange} title="Create Quiz Name">
          <Modal.Section>
            <TextField
              label="Question Name"
              value={question}
              onChange={handleChangeQuestion}
              autoComplete="off"
            />
            <br />
            <LegacyStack>
              <TextField
                label="A"
                value={answerA}
                onChange={handleTextFieldChangeA}
                autoComplete="off"
              />
              <TextField
                label="B"
                value={answerB}
                onChange={handleTextFieldChangeB}
                autoComplete="off"
              />
            </LegacyStack>
            <br />
            <LegacyStack>
              <TextField
                label="C"
                value={answerC}
                onChange={handleTextFieldChangeC}
                autoComplete="off"
              />
              <TextField
                label="D"
                value={answerD}
                onChange={handleTextFieldChangeD}
                autoComplete="off"
              />
            </LegacyStack>
            <br />
            <TextField
              label="Input the correctAnswer"
              value={correctAnswer}
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
            <Button onClick={handleChange}>Cancal</Button>
          </Modal.Section>
        </Modal>
      </Frame>
      <Frame>
        <Modal open={active1} onClose={handleChange1} title="Delete">
          <Modal.Section>
            <p>Are you sure you want to delete this Question ?</p>
            <br />
            <br />
            <Button variant="primary" tone="critical" onClick={handleDelete}>
              Remove
            </Button>
            &nbsp;
            <Button onClick={handleChange1}>Cancal</Button>
          </Modal.Section>
        </Modal>
      </Frame>
    </div>
  );
};

export default list;

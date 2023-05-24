import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from '../questions/entities/question.entity';
import { Repository } from 'typeorm';
import { AnswerEntity } from '../answers/entities/answer.entity';
import { ProductionEntity } from '../production/entities/production.entity';
import { SubscriptionTypeEntity } from '../subscription/entities/subscription-type.entity';

@Injectable()
export class SurveyService {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepository: Repository<QuestionEntity>,
    @InjectRepository(AnswerEntity)
    private readonly answerRepository: Repository<AnswerEntity>,
    @InjectRepository(ProductionEntity)
    private readonly productionRepository: Repository<ProductionEntity>,
    @InjectRepository(SubscriptionTypeEntity)
    private readonly subTypeRepository: Repository<SubscriptionTypeEntity>
  ) {}

  async getQuestions(): Promise<QuestionEntity[]> {
    return await this.questionRepository.find({ relations: ['answers'] });
  }

  async findProduction(answerId: number): Promise<ProductionEntity> {
    const answer = await this.answerRepository.findOne({ 
      where: { id_answer: answerId },
      relations: ["production"]
    });
    
    if (!answer || !answer.production) {
      return null;
    }
  
    return answer.production;
  }
  

  async getAnswers(ids: number[]): Promise<AnswerEntity[]> {
    return await this.answerRepository.findByIds(ids);
  }

  async getProductionsByAnswers(answers: AnswerEntity[]): Promise<ProductionEntity[]> {
    return await this.productionRepository.findByIds(answers.map( a => a.id_answer));
  }

  async executeProduction(production: ProductionEntity): Promise<any> {
    return await this.subTypeRepository.query(production.sql_query);
  }

  async processSurvey(answerId: number): Promise<any> {
    const production = await this.findProduction(answerId);
  
    if (!production) {
      return null;
    }
  
    const result = await this.executeProduction(production);
  
    return result;
  }
}
